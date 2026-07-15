import { beforeEach, describe, jest, expect, test } from "@jest/globals"
import UserService from "../services/user.service"
import UserRepository from "../repositories/user.repository"


jest.mock("../repositories/user.repository.js")
jest.mock("../repositories/project.repository.js")
jest.mock("../services/email.service.js")

describe("UserService", () => {
    // Datos de prueba que vamos a utilizar
    const mockUserData = {
        email: "usertest@test.com",
        username: "usertest",
        password: "Test456",
        repeatPassword: "Test456"
    }

    const mockUserCreated = {
        _id: "mockedId1234",
        email: "usertest@test.com",
        username: "usertest",
        passwordHash: "passwordHashed",
        verified_email: false,
        toObject: function (){
            return{
                _id: this._id,
                email: this.email,
                username: this.username,
                passwordHash: this.passwordHash
            }
        }
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("createUser", () => {
        test("deberia fallar si el email ya existe", async () =>{
            // Arrange = todo lo necesario antes de ejecutar
            const userData = {...mockUserData, email: "usertest@test.com"}
            UserRepository.getByEmail.mockResolvedValue(mockUserCreated)

            // Act = Ejecutamos la funcion que estamos probando
            const result = UserService.createUser(userData)

            // Assert = verificamos el resultado
            await expect(result).rejects.toThrow("Email already in use")
            expect(UserRepository.createUser).not.toHaveBeenCalled()
        })

        test("deberia fallar si el username ya existe", async () => {
            // Arrange = todo lo necesario antes de ejecutar
            UserRepository.getByEmail.mockResolvedValue(null)
            UserRepository.getByUsername.mockResolvedValue({...mockUserCreated, username: "usertest"})

            // Act = Ejecutamos la funcion que estamos probando
            const result = UserService.createUser(mockUserData)

            // Assert = verificamos el resultado
            await expect(result).rejects.toThrow("Username already in use")
            expect(UserRepository.createUser).not.toHaveBeenCalled()
        })

        test("deberia crear al usuario exitosamente", async () => {
            // Arrange = todo lo necesario antes de ejecutar
            UserRepository.getByEmail.mockResolvedValue(null)
            UserRepository.getByUsername.mockResolvedValue(null)
            UserRepository.createUser.mockResolvedValue(mockUserCreated)

            // Act
            const result = await UserService.createUser(mockUserData)

            // Assert
            expect(result).toEqual(mockUserCreated)
            expect(UserRepository.getByEmail).toHaveBeenCalledWith(mockUserData.email)
            expect(UserRepository.getByUsername).toHaveBeenCalledWith
            (mockUserData.username)
            expect(UserRepository.createUser).toHaveBeenCalledWith(mockUserData)
            expect(UserRepository.createUser).toHaveBeenCalledTimes(1)            
        })
    })

    describe("deleteUserById", () => {
        test("deberia fallar si el ID es invalido", async () => {
            // Arrange
            // No hace falta mockear getById y deleteById, solo con pasarle un ID invalido como string este ya lo tomara como invalido.
            const invalidId = "id-invalido-456"

            // Act
            const result = UserService.deleteUserById(invalidId)

            await expect(result).rejects.toThrow("Invalid user ID")
            expect(UserRepository.getById).not.toHaveBeenCalled()
            expect(UserRepository.deleteById).not.toHaveBeenCalled()
        })

        test("Deberia fallar si el usuario no existe", async () => {
            const noExistentId = "507f1f77bcf86cd799439011"
            UserRepository.getById.mockResolvedValue(null)

            const result = UserService.deleteUserById(noExistentId)

            await expect(result).rejects.toThrow("User not found")
            expect(UserRepository.getById).toHaveBeenCalledWith(noExistentId)
            expect(UserRepository.deleteById).not.toHaveBeenCalled()
        })

        test("deberia eliminar al usuario exitosamente", async () => {
            const userId = "507f1f77bcf86cd799439011"
            UserRepository.getById.mockResolvedValue(mockUserCreated)
            UserRepository.deleteById.mockResolvedValue(mockUserCreated)

            const result = await UserService.deleteUserById(userId)

            expect(result).toEqual(mockUserCreated)
            expect(UserRepository.getById).toHaveBeenCalledWith(userId)
            expect(UserRepository.deleteById).toHaveBeenCalledWith(userId)

        })
    })
})