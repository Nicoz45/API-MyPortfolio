import { beforeEach, expect, jest } from "@jest/globals";
import FileService from "../services/file.service";
import FileRepository from "../repositories/file.repository";
import ProjectRepository from "../repositories/project.repository";
import { array } from "joi";
import { ROLE_LIMITS } from "../constants/roles.constants";
import User from "../Models/User.model";

jest.mock("../repositories/project.repository.js");
jest.mock("../repositories/file.repository.js");

describe("FileService", () => {
    const mockedProjectId = "507f1f77bcf86cd799439022";
    const mockedFileId = "507f1f77bcf86cd799439023";
    const mockedUserId = "507f1f77bcf86cd799439054";

    const mockFileData = {
        project: mockedProjectId,
        path: "mocked/path/to/file.txt",
        content: "This is a mocked file content",
        language: "txt"
    }

    const mockFileCreated = {
        _id: mockedFileId,
        project: mockedProjectId,
        path: "mocked/path/to/file.txt",
        content: "This is a mocked file content",
        language: "txt"
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("createFile", () => {
        test("deberia fallar si falta el path", async () => {
            const mockedFileData = { project: mockedProjectId, content: "File-content", languaje: "txt" }
            const mockUser = {}

            const result = FileService.createFile(mockedFileData, mockUser)

            await expect(result).rejects.toThrow("Project and path any required")
            expect(FileRepository.createFile).not.toHaveBeenCalled()
        })

        test("deberia fallar si no es un objectId valido", async () => {
            const fileData = { project: "Invalid-project-id", path: "mocked/path/to/file.txt", content: "File-content", languaje: "txt" }
            const user = {}

            const result = FileService.createFile(fileData, user)

            await expect(result).rejects.toThrow("Invalid project ID")
            expect(FileRepository.createFile).not.toHaveBeenCalled()
        })

        test("deberia fallar si no se encuentra el proyecto", async () => {
            const fileData = mockFileData;
            const user = { _id: mockedUserId }
            ProjectRepository.getProjectById.mockResolvedValue(null)

            const result = FileService.createFile(fileData, user)

            await expect(result).rejects.toThrow("Project not found")
            expect(FileRepository.createFile).not.toHaveBeenCalled()
        })

        test("deberia fallar si no es dueño del proyecto", async () => {
            const fileData = mockFileData;
            const user = {_id: mockedUserId}
            const projectFound = {
                _id: mockedProjectId,
                owner: {_id: "507f1f77bcf86cd799439088"},
                title: "Mi Portfolio",
                techStack: ["React", "Node", "MongoDB"],
                visibility: "public",
                stars: 0,
                starredBy: []
            }
            ProjectRepository.getProjectById.mockResolvedValue(projectFound)

            const result = FileService.createFile(fileData, user)

            await expect(result).rejects.toThrow("You can only add files to your own projects");
            expect(ProjectRepository.getProjectById).toHaveBeenCalledWith(fileData.project)
            expect(FileRepository.createFile).not.toHaveBeenCalled()
        })

        test("deberia fallar cuando se llega al limite de archivos", async () => {
            const fileData = mockFileData;
            const user = {_id: mockedUserId, role: "user"}
            const limit = ROLE_LIMITS[user.role].maxFilesPerProject
            const projectFound = {
                _id: mockedProjectId, 
                owner: {_id: mockedUserId},
                title: "Mi portfolio",
                visibility: "public"
            }
            // .fill: rellena espacios. Esto simula 20 archivos ya existentes.
            const existingFiles = new Array(20).fill({})

            ProjectRepository.getProjectById.mockResolvedValue(projectFound)
            FileRepository.getFilesByProject.mockResolvedValue(existingFiles)

            const result = FileService.createFile(fileData, user)

            await expect(result).rejects.toThrow(`You have reached the file limit for this project (${limit})`)
            expect(FileRepository.createFile).not.toHaveBeenCalled()
        })
    })
})