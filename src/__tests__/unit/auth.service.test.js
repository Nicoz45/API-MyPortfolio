import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import AuthService from "../../services/auth.service.js";
import UserRepository from "../../repositories/user.repository.js";
import EmailService from "../../services/email.service.js";
import { ServerError } from "../../services/Error.service.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

// Mockeamos los modulos externos para no tocar MongoDb ni mandar emails.
jest.mock("../../repositories/user.repository.js")
jest.mock("../../services/email.service.js")
jest.mock("bcrypt")
jest.mock("jsonwebtoken")

describe("AuthService", () => {
    // Pasamos datos de prueba que vamos a utilizar
    const mockUserData = {
        email: "test@test.com",
        username: "testuser",
        password: "Test1234",
        repeatPassword: "Test1234"
    }

    const mockUserCreated = {
        _id: "mockedId123",
        email: "test@test.com",
        username: "testuser",
        passwordHash: "hashedPassword",
        verified_email: false,
        toObject: function () {
            return {
                _id: this._id,
                email: this.email,
                username: this.username,
                passwordHash: this.passwordHash
            }
        }
    }
    // beforeEach se ejecuta antes de cada test, para limpiar los mocks y evitar que se acumulen llamadas de tests anteriores, lo que podria generar falsos positivos o negativos en los tests.
    beforeEach(() => {
        // Limpiamos todos los mocks antes de cada test
        jest.clearAllMocks()
    })

    // Register
    // Testeamos la funcion register del AuthService
    describe("register", () => {
        test("deberia fallar si las contraseñas no coinciden", async () => {
            // Arrange = todo lo necesario antes de ejecutar
            const userData = { ...mockUserData, repeatPassword: "hashedPassword" }

            // Act = ejecutamos la funcion que estamos probando
            const result = AuthService.register(userData)

            // Assert = aca es donde verificamos el resultado
            await expect(result).rejects.toThrow("Passwords do not match")
            expect(UserRepository.getByEmail).not.toHaveBeenCalled()
        })

        test("deberia fallar si el email ya existe", async () => {
            // Arrange
            UserRepository.getByEmail.mockResolvedValue(mockUserCreated)
            //Act
            const result = AuthService.register(mockUserData)
            // Assert
            await expect(result).rejects.toThrow("User already exist")
            expect(UserRepository.createUser).not.toHaveBeenCalled()
        })

        test("deberia crear al usuario correctamente", async () => {
            // Arrange
            UserRepository.getByEmail.mockResolvedValue(null)
            UserRepository.createUser.mockResolvedValue(mockUserCreated)
            bcrypt.hash.mockResolvedValue("hashedPassword")
            jwt.sign.mockReturnValue("mockedToken")
            EmailService.sendVerificationEmail.mockResolvedValue()

            // Act
            const result = await AuthService.register(mockUserData)

            // Assert
            expect(result).toHaveProperty("token")
            expect(result).toHaveProperty("user")
            expect(result.user).not.toHaveProperty("passwordHash")// No debe exponer el hash
            expect(UserRepository.createUser).toHaveBeenCalledTimes(1)
            expect(EmailService.sendVerificationEmail).toHaveBeenCalledWith(mockUserData.email, "mockedToken")
        })

        test("no deberia exponer el passwordHash en el usuario retornado", async () => {
            //Arrange
            UserRepository.getByEmail.mockResolvedValue(null)
            UserRepository.createUser.mockResolvedValue(mockUserCreated)
            bcrypt.hash.mockResolvedValue("hashedPassword")
            jwt.sign.mockReturnValue("mockedToken")
            EmailService.sendVerificationEmail.mockResolvedValue()

            // Act
            const result = await AuthService.register(mockUserData)

            // Assert
            expect(result.user.passwordHash).toBeUndefined()
        })
    })

    describe("login", () => {
        const mockUserVerified = {
            ...mockUserCreated,
            verified_email: true,
            active: true,
            passwordHash: "hashedPassword"
        }

        test("deberia fallar si el usuario no existe", async () => {
            // Arrange
            UserRepository.getByEmail.mockResolvedValue(null)
            UserRepository.getByUsername.mockResolvedValue(null)

            // Act
            const result = AuthService.login({
                emailOrUsername: "noexiste@test.com",
                password: "Test1234"
            })

            // Assert
            await expect(result).rejects.toThrow("User not found")
        })
        test("deberia fallar si el email no esta verificado", async () => {
            // Arrange
            UserRepository.getByEmail.mockResolvedValue({
                ...mockUserCreated,
                verified_email: false,
            })

            // Act
            const result = AuthService.login({
                emailOrUsername: "test@test.com",
                password: "Test1234"
            })

            // Assert
            await expect(result).rejects.toThrow("Email not verified")
        })
        test("deberia fallar si la contrasena es incorrecta", async () => {
            // Arrange
            UserRepository.getByEmail.mockResolvedValue(mockUserVerified)
            bcrypt.compare.mockResolvedValue(false)

            // Act
            const result = AuthService.login({
                emailOrUsername: "test@test.com",
                password: "wrongPassword1"
            })

            // Assert
            await expect(result).rejects.toThrow("Incorrect Password")
        })

        test("deberia logear correctamente y retornar tokens", async () => {
            UserRepository.getByEmail.mockResolvedValue(mockUserVerified)
            bcrypt.compare.mockResolvedValue(true)
            jwt.sign.mockReturnValue("mockedToken")

            const result = await AuthService.login({
                emailOrUsername: "test@test.com",
                password: "Test1234"
            })

            expect(result).toHaveProperty("accesToken")
            expect(result).toHaveProperty("refreshToken")
            expect(result).toHaveProperty("user")
            expect(result.user.passwordHash).toBeUndefined()
        })

        test("deberia buscar por username si no contiene @", async () => {
            UserRepository.getByUsername.mockResolvedValue(mockUserVerified)
            bcrypt.compare.mockResolvedValue(true)
            jwt.sign.mockReturnValue("mockedToken")

            const result = await AuthService.login({
                emailOrUsername: "testuser",
                password: "Test1234"
            })

            expect(UserRepository.getByUsername).toHaveBeenCalledWith("testuser")
            expect(UserRepository.getByEmail).not.toHaveBeenCalled()
        })
    })
})




