import { beforeEach, describe, expect, jest, test } from "@jest/globals"
import registerUserCase from "../../application/register-user.usecase.js"
import AuthService from "../../services/auth.service.js"
import { ServerError } from "../../services/Error.service.js"

jest.mock("../../services/auth.service.js")

describe("registerUserCase", () => {
    const mockUserData = {
        email: "prueba@test.com",
        username: "prueba",
        password: "Test1234",
        repeatPassword: "Test1234"
    }

    const mockRegisterResult = {
        token: "mockedToken",
        user: {
            _id: "507f1f77bcf86cd799439022",
            email: mockUserData.email,
            username: mockUserData.username
        }
    }

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("deberia ejecutar el usecase y retornar el resultado de AuthService.register", async () => {
        AuthService.register.mockResolvedValue(mockRegisterResult);

        const result = await registerUserCase.execute(mockUserData);

        expect(result).toEqual(mockRegisterResult);
        expect(AuthService.register).toHaveBeenCalledWith(mockUserData);
    })

    test("deberia relanzar el ServerError tal como viene de AuthService.register", async () => {
        const serverError = new ServerError(409, "User already exist");
        AuthService.register.mockRejectedValue(serverError);

        const result = registerUserCase.execute(mockUserData);

        await expect(result).rejects.toThrow("User already exist");
        expect(AuthService.register).toHaveBeenCalledWith(mockUserData);
    })

    test("deberia envolver errores inesperados en un ServerError 500", async () => {
        AuthService.register.mockRejectedValue(new Error("Unexpected failure"));

        const result = registerUserCase.execute(mockUserData);

        await expect(result).rejects.toMatchObject({
            status: 500,
            message: "Unexpected failure"
        })
        expect(AuthService.register).toHaveBeenCalledWith(mockUserData);
    })
})