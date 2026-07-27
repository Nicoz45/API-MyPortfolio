import { beforeEach, expect, jest } from "@jest/globals";
import AuthService from "../../services/auth.service";
import { ServerError } from "../../services/Error.service";
import loginUserUseCase from "../../application/login-user.usecase";

jest.mock("../../services/auth.service.js")

describe("loginUserUseCase", () => {
    const mockUserData = {
        emailOrUsername: "testuser",
        password: "Test1234"
    }

    const mockLoginResult = {
        token: "mockedToken",
        user: {
            _id: "507f1f77bcf86cd799439022",
            email: "testuser@test.com",
            username: "testuser"
        }
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("deberia ejecutar el usecase y retornar el resultado de AuthService.login", async () => {
        AuthService.login.mockResolvedValue(mockLoginResult)

        const result = await loginUserUseCase.execute(mockUserData)

        expect(result).toEqual(mockLoginResult)
        expect(AuthService.login).toHaveBeenCalledWith(mockUserData)
    })

    test("deberia relanzar el ServerError tal como viene de AuthService.login", async () => {
        const serverError = new ServerError(401, "Invalid credentials")
        AuthService.login.mockRejectedValue(serverError)

        const result = loginUserUseCase.execute(mockUserData)

        await expect(result).rejects.toThrow("Invalid credentials")
        expect(AuthService.login).toHaveBeenCalledWith(mockUserData)
    })

    test("deberia envolver errores inesperados en un ServerError 500", async () => {
        AuthService.login.mockRejectedValue(new Error("Unexpected failure"))

        const result = loginUserUseCase.execute(mockUserData)

        await expect(result).rejects.toMatchObject({
            status: 500,
            message: "Unexpected failure"
        })
        expect(AuthService.login).toHaveBeenCalledWith(mockUserData)
    })
})