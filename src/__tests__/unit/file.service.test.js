import { beforeEach, describe, expect, jest } from "@jest/globals";
import FileService from "../../services/file.service";
import FileRepository from "../../repositories/file.repository";
import ProjectRepository from "../../repositories/project.repository";
import { array, invalid } from "joi";
import { ROLE_LIMITS } from "../../constants/roles.constants";
import User from "../../Models/User.model";

jest.mock("../../repositories/project.repository.js");
jest.mock("../../repositories/file.repository.js");

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
            const user = { _id: mockedUserId }
            const projectFound = {
                _id: mockedProjectId,
                owner: { _id: "507f1f77bcf86cd799439088" },
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
            const user = { _id: mockedUserId, role: "user" }
            const limit = ROLE_LIMITS[user.role].maxFilesPerProject
            const projectFound = {
                _id: mockedProjectId,
                owner: { _id: mockedUserId },
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

        test("deberia fallar si existe un archivo con el mismo path", async () => {
            const fileData = mockFileData;
            const user = { _id: mockedUserId, role: "user" };
            const mockedProject = {
                _id: mockedProjectId,
                owner: { _id: mockedUserId },
                title: "Mi portfolio",
                visibility: "public",
            };
            const pathFound = { path: "mocked/path/to/file.txt" }
            const existingFiles = new Array(5).fill({})

            ProjectRepository.getProjectById.mockResolvedValue(mockedProject)
            FileRepository.getFilesByProject.mockResolvedValue(existingFiles)
            FileRepository.getFileByProjectAndPath.mockResolvedValue(pathFound)

            const result = FileService.createFile(fileData, user)

            await expect(result).rejects.toThrow("A file with this path already exists in the project")
            expect(FileRepository.createFile).not.toHaveBeenCalled()
        })

        test("deberia crear el archivo exitosamente", async () => {
            const fileData = mockFileData;
            const user = { _id: mockedUserId, role: "user" };
            const mockProject = {
                _id: mockedProjectId,
                owner: { _id: mockedUserId },
                title: "Mi portfolio",
                visibility: "public",
            }
            const existingFiles = new Array(5).fill({})

            ProjectRepository.getProjectById.mockResolvedValue(mockProject)
            FileRepository.getFilesByProject.mockResolvedValue(existingFiles)
            FileRepository.getFileByProjectAndPath.mockResolvedValue(null)
            FileRepository.createFile.mockResolvedValue(mockFileCreated)

            const result = await FileService.createFile(fileData, user)

            expect(result).toEqual(mockFileCreated)
            expect(ProjectRepository.getProjectById).toHaveBeenCalledWith(fileData.project)
            expect(FileRepository.createFile).toHaveBeenCalledWith(fileData)
            expect(FileRepository.getFilesByProject).toHaveBeenCalledWith(fileData.project)
            expect(FileRepository.getFileByProjectAndPath).toHaveBeenCalledWith(fileData.project, fileData.path)
        })
    })
    describe("getFileById", () => {
        test("deberia fallar si el Id no es un object ID valido", async () => {
            const invalidId = "invalid_file_ID"

            const result = FileService.getFileById(invalidId)

            await expect(result).rejects.toThrow("Invalid file ID")
            expect(FileRepository.getFileById).not.toHaveBeenCalled()
        })

        test("deberia fallar si no existe el archivo buscado", async () => {
            const fileId = mockedFileId;
            FileRepository.getFileById.mockResolvedValue(null)

            const result = FileService.getFileById(fileId)

            await expect(result).rejects.toThrow("File not found")
            expect(FileRepository.getFileById).toHaveBeenCalledTimes(1)
        })

        test("deberia obtener el archivo exitosamente", async () => {
            const fileId = mockedFileId;
            FileRepository.getFileById.mockResolvedValue(mockFileCreated)

            const result = await FileService.getFileById(fileId)

            expect(result).toEqual(mockFileCreated)
            expect(FileRepository.getFileById).toHaveBeenCalledWith(fileId)
        })
    })

    describe("getFileByProject", () => {
        test("deberia fallar si no es un objectId valido", async () => {
            const invalidId = "invalid_project_Id";

            const result = FileService.getFileByProject(invalidId)

            await expect(result).rejects.toThrow("Invalid project ID")
            expect(FileRepository.getFilesByProject).not.toHaveBeenCalled()
        })

        test("deberia devolver un array vacio si no encuentra archivos", async () => {
            const projectId = mockedProjectId;
            FileRepository.getFilesByProject.mockResolvedValue([])

            const result = await FileService.getFileByProject(projectId)

            expect(result).toEqual([])
            expect(FileRepository.getFilesByProject).toHaveBeenCalledWith(projectId)
        })

        test("deberia obtener el archivo por proyecto exitosamente", async () => {
            const projectId = mockedProjectId;
            FileRepository.getFilesByProject.mockResolvedValue(mockFileCreated)

            const result = await FileService.getFileByProject(projectId)

            expect(result).toEqual(mockFileCreated)
            expect(FileRepository.getFilesByProject).toHaveBeenCalledWith(projectId)
        })
    })
    describe("getFileByLanguage", () => {
        test("deberia fallar si no encuentra el lenguaje", async () => {
            const language = "";

            const result = FileService.getFileByLanguage(language)

            await expect(result).rejects.toThrow("Language must be a non-empty string")
            expect(FileRepository.getFilesByLanguage).not.toHaveBeenCalled()
        })
        test("deberia devolver un array vacio si no hay ningun archivo", async () => {
            const language = "txt";
            FileRepository.getFilesByLanguage.mockResolvedValue([])

            const result = await FileService.getFileByLanguage(language)

            expect(result).toEqual([])
            expect(FileRepository.getFilesByLanguage).toHaveBeenCalledWith(language)
        })
        test("debria devolver los archivos exitosamente", async () => {
            const language = "txt";
            FileRepository.getFilesByLanguage.mockResolvedValue([mockFileCreated])

            const result = await FileService.getFileByLanguage(language)

            expect(result).toEqual([mockFileCreated])
            expect(FileRepository.getFilesByLanguage).toHaveBeenCalledWith(language)
        })
    })

    describe("getFileByProjectAndPath", () => {
        test("deberia fallar si no es un objectId valido", async () => {
            const invalidId = "invalid_project_id";
            const path = "project_path"

            const result = FileService.getFileByProjectAndPath(invalidId, path)

            await expect(result).rejects.toThrow("Invalid project ID")
            expect(FileRepository.getFileByProjectAndPath).not.toHaveBeenCalled()
        })

        test("deberia fallar si no hay path", async () => {
            const projectId = mockedProjectId;

            const result = FileService.getFileByProjectAndPath(projectId)

            await expect(result).rejects.toThrow("Path is required")
            expect(FileRepository.getFileByProjectAndPath).not.toHaveBeenCalled()
        })

        test("deberia devolver null si no se encuentra el archivo", async () => {
            const projectId = mockedProjectId;
            const path = "mocked/path/to/file.txt";
            FileRepository.getFileByProjectAndPath.mockResolvedValue(null)

            const result = await FileService.getFileByProjectAndPath(projectId, path)

            expect(result).toBeNull()
            expect(FileRepository.getFileByProjectAndPath).toHaveBeenCalledWith(projectId, path)
        })

        test("deberia devolver el archivo con exito", async () => {
            const projectId = mockedProjectId;
            const path = "mocked/path/to/file.txt";
            FileRepository.getFileByProjectAndPath.mockResolvedValue(mockFileCreated);

            const result = await FileService.getFileByProjectAndPath(projectId, path)

            expect(result).toEqual(mockFileCreated)
            expect(FileRepository.getFileByProjectAndPath).toHaveBeenCalledWith(projectId, path)
        })
    })
    describe("updateFile", () => {
        test("deberia fallar si no es un objectId valido", async () => {
            const invalidId = "invalid_file_id";
            const update_data = {
                project: mockedProjectId,
                path: "mocked/path/to/file.txt",
                content: "Mi portfolio collections",
                language: "txt"
            }
            const user = "Nicoz45";

            const result = FileService.updateFile(invalidId, update_data, user)

            await expect(result).rejects.toThrow("Invalid project ID")
            expect(FileRepository.updateFile).not.toHaveBeenCalled()
        })
        test("deberia fallar si no encuentra el archivo", async () => {
            const file_id = mockedFileId;
            const update_data = {
                project: mockedProjectId,
                path: "mocked/path/to/file.txt",
                content: "Mi portfolio collections",
                language: "txt"
            }
            const user = "Nicoz45";

            FileRepository.getFileById.mockResolvedValue(null)

            const result = FileService.updateFile(file_id, update_data, user)

            await expect(result).rejects.toThrow("File not found")
            expect(FileRepository.updateFile).not.toHaveBeenCalled()
        })
        test("deberia fallar si el usuario no es dueño del proyecto donde se encuetra el archivo", async () => {
            const file_id = mockedFileId;
            const update_data = {
                project: mockedProjectId,
                path: "mocked/path/to/file.txt",
                content: "Mi portfolio collections",
                language: "txt"
            }
            const user = { _id: mockedUserId }
            const projectFound = {
                owner: { _id: "Nicoz45" },
                title: "Mi Portfolio",
                techStack: ["React", "Node", "MongoDB"],
                visibility: "public",
            }
            FileRepository.getFileById.mockResolvedValue(mockFileCreated)
            ProjectRepository.getProjectById.mockResolvedValue(projectFound)

            const result = FileService.updateFile(file_id, update_data, user)

            await expect(result).rejects.toThrow("You can only modify files from your own projects")
            expect(FileRepository.updateFile).not.toHaveBeenCalled()
        })
        test("deberia fallar si existe otro archivo con el mismo path", async () => {
            const file_id = mockedFileId;
            const update_data = {
                path: "mocked/path/to/another-file.txt",
                content: "Mi portfolio collections",
                language: "txt"
            };
            const user = { _id: mockedUserId }
            const projectFound = {
                owner: { _id: mockedUserId },
                title: "Mi Portfolio",
                techStack: ["React", "Node", "MongoDB"],
                visibility: "public",
            }
            const fileFound = {
                _id: "507f1f77bcf86cd799439099",
                project: mockedProjectId,
                path: "mocked/path/to/another-file.txt",
                content: "Otro archivo",
                language: "txt"
            }
            FileRepository.getFileById.mockResolvedValue(mockFileCreated)
            ProjectRepository.getProjectById.mockResolvedValue(projectFound)
            FileRepository.getFileByProjectAndPath.mockResolvedValue(fileFound)

            const result = FileService.updateFile(file_id, update_data, user)

            await expect(result).rejects.toThrow("A file with this path already exists in the projects")
            expect(FileRepository.updateFile).not.toHaveBeenCalled()
        })
        test("deberia actualizar el archivo con exito", async () => {
            const file_id = mockedFileId;
            const update_data = {
                path: "mocked/path/to/file.txt",
                content: "Mi portfolio collections",
                language: "txt"
            };
            const user = { _id: mockedUserId }
            const projectFound = {
                owner: { _id: mockedUserId },
                title: "Mi Portfolio",
                techStack: ["React", "Node", "MongoDB"],
                visibility: "public",
            }
            FileRepository.getFileById.mockResolvedValue(mockFileCreated)
            ProjectRepository.getProjectById.mockResolvedValue(projectFound)
            FileRepository.updateFile.mockResolvedValue( { ...mockFileCreated, ...update_data })

            const result = await FileService.updateFile( file_id, update_data, user)

            expect(result).toEqual({ ...mockFileCreated, ...update_data })
            expect(FileRepository.updateFile).toHaveBeenCalledWith(file_id, update_data)
        })
    })
    describe("deleteFile", () => {
        test("deberia fallar si no es un objectId valido", async () => {
            const invalidFileId = "invalid_id";
            const user = "Nicoz45"

            const result = FileService.deleteFile(invalidFileId, user)

            await expect(result).rejects.toThrow("Invalid file ID")
            expect(FileRepository.deleteFile).not.toHaveBeenCalled()
        })
        test("deberia fallar si no encuentra el archivo", async () => {
            const file_id = mockedFileId;
            const user = "Nicoz45";
            FileRepository.getFileById.mockResolvedValue(null)

            const result = FileService.deleteFile(file_id, user)

            await expect(result).rejects.toThrow("File not found")
            expect(FileRepository.deleteFile).not.toHaveBeenCalled()
        })
        test("deberia fallar si no es dueño del proyecto", async () => {
            const file_id = mockedFileId;
            const user = {_id: mockedUserId};
            const projectFound = {
                owner: { _id: "507f1f77bcf86cd799438935" },
                title: "Mi Portfolio",
                techStack: ["React", "Node", "MongoDB"],
                visibility: "public",
            }
            FileRepository.getFileById.mockResolvedValue(mockFileCreated)
            ProjectRepository.getProjectById.mockResolvedValue(projectFound)

            const result = FileService.deleteFile(file_id, user)

            await expect(result).rejects.toThrow("You can only delete files from your own projects")
            expect(FileRepository.deleteFile).not.toHaveBeenCalled()
        })
        test("deberia eliminar el archivo con exito", async () => {
            const file_id = mockedFileId;
            const user = {_id: mockedUserId};
            const projectFound = {
                owner: { _id: mockedUserId },
                title: "Mi Portfolio",
                techStack: ["React", "Node", "MongoDB"],
                visibility: "public",
            }
            FileRepository.getFileById.mockResolvedValue(mockFileCreated)
            ProjectRepository.getProjectById.mockResolvedValue(projectFound)
            FileRepository.deleteFile.mockResolvedValue({...mockFileCreated})

            const result = await FileService.deleteFile(file_id, user)

            expect(result).toEqual({...mockFileCreated})
            expect(FileRepository.deleteFile).toHaveBeenCalledWith(file_id)
        })
    })
})