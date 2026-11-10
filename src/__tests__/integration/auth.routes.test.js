import app from "../../app.js"
import request from "supertest"
import EmailService from "../../services/email.service.js"
import UserRepository from "../../repositories/user.repository.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import ENVIRONMENT from "../../config/env.config.js"


jest.mock("../../repositories/user.repository.js")
jest.mock("../../services/email.service.js")
jest.mock("bcrypt")
jest.mock("jsonwebtoken")


describe("POST /auth/register", () => {
    test("deberia fallar si no se cumple el esquema", async () => {
        const invalidData = { email: "nicoTest@gmail.com", username: "nicoTest", password: "Test123456" }

        const response = await request(app).post("/auth/register").send(invalidData)

        expect(response.status).toBe(400)
        expect(response.body.ok).toBe(false)
    })

    test("deberia fallar si ya existe el usuario por email", async () => {
        const userData = {
            email: "nicoTest@gmail.com",
            username: "nicoTest",
            password: "Test123456",
            repeatPassword: "Test123456"
        }
        UserRepository.getByEmail.mockResolvedValue({email: "nicoTest@gmail.com"})

        const response = await request(app).post("/auth/register").send(userData)

        expect(response.status).toBe(500)
        expect(response.body.ok).toBe(false)
    })

    test("deberia registrar al usuario con exito", async () => {
        const userData = {
            email: "nicoTest@gmail.com",
            username: "nicoTest",
            password: "Test123456",
            repeatPassword: "Test123456"
        }
        const passwordHash = "hashedPassword"
        const userCreated = {
            _id: "507f1f77bcf86cd799439054",
            username: userData.username,
            email: userData.email,
            passwordHash: passwordHash,
            verified_email: false
        }
        UserRepository.getByEmail.mockResolvedValue(null)
        bcrypt.hash.mockResolvedValue(passwordHash)
        UserRepository.createUser.mockResolvedValue(userCreated)

        const response = await request(app).post("/auth/register").send(userData)

        expect(response.status).toBe(201)
        expect(response.body.ok).toBe(true)
    })
})

describe("POST /auth/login", () => {
    test("deberia fallar si falta algun dato", async () => {
        const invalidData = {emailOrUsername: "nicoTest"}

        const response = await request(app).post("/auth/login").send(invalidData)

        expect(response.status).toBe(400)
        expect(response.body.ok).toBe(false)
    })

    test("deberia fallar si no encuentra al usuario", async () => {
        const userData = { emailOrUsername: "nicoTest@gmail.com", password: "Test123456"}
        UserRepository.getByEmail.mockResolvedValue(null)
        UserRepository.getByUsername.mockResolvedValue(null)

        const response = await request(app).post("/auth/login").send(userData)

        expect(response.status).toBe(404)
        expect(response.body.message).toBe("User not found")
    })

    test("deberia fallar si no tiene el email verificado", async () => {
        const userData = { emailOrUsername: "nicoTest@gmail.com", password: "Test123456"}
        const passwordHash = "hashedPassword"
        const userCreated = {
            _id: "507f1f77bcf86cd799439054",
            username: userData.username,
            email: userData.email,
            passwordHash: passwordHash,
            verified_email: false
        }
        UserRepository.getByEmail.mockResolvedValue(userCreated)
        UserRepository.getByUsername.mockResolvedValue(userCreated)

        const response = await request(app).post("/auth/login").send(userData)

        expect(response.status).toBe(403)
        expect(response.body.message).toBe("Email not verified. Please verify your email before logging in.")
    })

    test("deberia fallar si las contraseñas no coinciden", async () => {
        const userData = { emailOrUsername: "nicoTest@gmail.com", password: "Test123456"}
        const passwordHash = "hashedPassword"
        const userCreated = {
            _id: "507f1f77bcf86cd799439054",
            username: userData.username,
            email: userData.email,
            passwordHash: passwordHash,
            verified_email: true
        }
        UserRepository.getByEmail.mockResolvedValue(userCreated)
        UserRepository.getByUsername.mockResolvedValue(userCreated)

        const response = await request(app).post("/auth/login").send(userData)

        expect(response.status).toBe(401)
        expect(response.body.message).toBe("Incorrect Password")
    })

    test("deberia loguearme al usuario con exito", async () => {
        const userData = { emailOrUsername: "nicoTest@gmail.com", password: "Test123456"}
        const passwordHash = "hashedPassword"
        const userCreated = {
            _id: "507f1f77bcf86cd799439054",
            username: userData.username,
            email: userData.email,
            passwordHash: passwordHash,
            verified_email: true
        }
        UserRepository.getByEmail.mockResolvedValue(userCreated)
        bcrypt.compare.mockResolvedValue(true)

        const response = await request(app).post("/auth/login").send(userData)

        expect(response.status).toBe(200)
        expect(response.ok).toBe(true)
        expect(response.body.accessToken).toBeDefined()
        expect(response.body.refreshToken).toBeDefined()
        expect(response.body.user.email).toBe(userCreated.email)
        expect(response.body.user.username).toBe(userCreated.username)
        expect(response.body.user.passwordHash).toBeUndefined()
    })
})

describe("GET /auth/verify-email/:token", () => {
    test("deberia fallar si el token es invalido", async () => {
        jwt.verify.mockResolvedValue(invalidToken)

        const response = await request(app).get("/auth/verify-email/:token").send(invalidToken)

        expect(response.status).toBe(400)
        expect(response.body.message).toBe("Invalid token")
    } )
})

