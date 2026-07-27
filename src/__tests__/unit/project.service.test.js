import ProjectService from "../../services/project.service.js";
import ProjectRepository from "../../repositories/project.repository.js";
import UserRepository from "../../repositories/user.repository.js";
import { ServerError } from "../../services/Error.service.js";
import mongoose from "mongoose";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { invalid } from "joi";

jest.mock("../../repositories/project.repository.js")
jest.mock("../../repositories/user.repository.js")

describe("ProjectService", () => {
    const validOwnerId = "507f1f77bcf86cd799439011"
    const validProjectId = "507f1f77bcf86cd799439022"

    const mockProjectData = {
        owner: validOwnerId,
        title: "Mi Portfolio",
        description: "Pagina de prueba",
        techStack: "React, Node, mongoDB",
        visibility: "public"
    }

    const mockProjectCreated = {
        _id: validProjectId,
        owner: validOwnerId,
        title: "Mi Portfolio",
        techStack: ["React", "Node", "MongoDB"],
        visibility: "public",
        stars: 0,
        starredBy: [],
    }
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("CreateProject", () => {
        test("deberia fallar si falta el titulo", async () => {
            // Arrange
            // Basicamente lo que hacemos aca es... la funcion de createPorject recibe un objeto con el owner y un title, por lo tanto primero creamos un campo sin el title y luego sin el owner, para que asi falle.
            const invalidData = {owner: validOwnerId} // Sin title

            // Act
            const result = ProjectService.createProject(invalidData)

            // Assert
            await expect(result).rejects.toThrow("Owner and title are required")
            expect(ProjectRepository.createProject).not.toHaveBeenCalled()
        })

        test("deberia fallar si falta el owner", async () => {
            const invalidData = {title: "Mi Portfolio"} // Sin el owner
    
            const result = ProjectService.createProject(invalidData)
    
            await expect(result).rejects.toThrow("Owner and title are required")
            expect(ProjectRepository.createProject).not.toHaveBeenCalled()
        })

        test("deberia crear el proyecto exitosamente cuando owner es un username", async () => {
            const projectData = {title: "Mi Portfolio", owner: "Nicoz45"}
            const mockUserFound = {_id: validOwnerId, username: "Nicoz45"}

            UserRepository.getByUsername.mockResolvedValue(mockUserFound)
            ProjectRepository.createProject.mockResolvedValue(mockProjectCreated)

            const result = await ProjectService.createProject(projectData)

            expect(result).toEqual(mockProjectCreated)
            expect(UserRepository.getByUsername).toHaveBeenCalledWith("Nicoz45")
            expect(UserRepository.getByEmail).not.toHaveBeenCalled()
            expect(ProjectRepository.createProject).toHaveBeenCalledWith(
                expect.objectContaining({owner: validOwnerId})) 
                // Esto es para que evalue solo el elemento owner dentro del objeto, ya que no sabemos el contenido que nos devolvera el mismo como para evaluar el objeto completo.
        })

        test("deberia crear el proyecto exitosamente cuando owner es un email", async () => {
            const projectData = {title: "Mi Portfolio", owner: "portfolio@gmail.com"}
            const mockUserFound = {_id: validOwnerId, email: "portfolio@gmail.com"}

            UserRepository.getByUsername.mockResolvedValue(null)
            UserRepository.getByEmail.mockResolvedValue(mockUserFound)
            ProjectRepository.createProject.mockResolvedValue(mockProjectCreated)

            const result = await ProjectService.createProject(projectData)

            expect(result).toEqual(mockProjectCreated)
            expect(UserRepository.getByEmail).toHaveBeenCalledWith("portfolio@gmail.com")
            expect(UserRepository.getByUsername).toHaveBeenCalledWith("portfolio@gmail.com")
            expect(ProjectRepository.createProject).toHaveBeenCalledWith(
                expect.objectContaining({owner: validOwnerId})) 
                // Esto es para que evalue solo el elemento owner dentro del objeto, ya que no sabemos el contenido que nos devolvera el mismo como para evaluar el objeto completo.
        })

        test("deberia fallar si el owner no existe", async () =>{
            const projectData = {title: "Mi portfolio", owner: "usuario_inexistente"}

            UserRepository.getByUsername.mockResolvedValue(null)
            UserRepository.getByEmail.mockResolvedValue(null)

            const result = ProjectService.createProject(projectData)

            await expect(result).rejects.toThrow("Owner not found")
            expect(UserRepository.getByUsername).toHaveBeenCalledWith("usuario_inexistente")
            expect(UserRepository.getByEmail).toHaveBeenCalledWith("usuario_inexistente")
            expect(ProjectRepository.createProject).not.toHaveBeenCalled()
        })

        test("owner ya es un objectId valido", async () => {
            const validObjectId = {title: "My portfolio", owner: validOwnerId}
            ProjectRepository.createProject.mockResolvedValue(mockProjectCreated)

            const result = await ProjectService.createProject(validObjectId)

            expect(result).toEqual(mockProjectCreated)
            expect(UserRepository.getByUsername).not.toHaveBeenCalled()
            expect(UserRepository.getByEmail).not.toHaveBeenCalled()
            expect(ProjectRepository.createProject).toHaveBeenCalledWith(expect.objectContaining({owner: validOwnerId}))
        })
    })
    describe("toggleStar", () => {
        test("deberia fallar si no se encuentra el proyecto", async () => {
            const projectId = "invalid_project_id";
            const userId = "invalid_user_id"
            ProjectRepository.getProjectById.mockResolvedValue(null)

            const result = ProjectService.toggleStar(projectId, userId)

            await expect(result).rejects.toThrow("Project not found")
            expect(ProjectRepository.getProjectById).toHaveBeenCalledWith(projectId);
            expect(ProjectRepository.removeStar).not.toHaveBeenCalled()
            expect(ProjectRepository.addStar).not.toHaveBeenCalled()
        })

        test("si ya tiene estrella, la quitamos", async () => {
            const userId = "507f1f77bcf86cd799439062"
            const mockProject = {_id: validProjectId, starredBy: [userId]}
            const mockProjectAfterRemove = {...mockProject, starredBy: [], stars: 0}
            ProjectRepository.getProjectById.mockResolvedValue(mockProject)
            ProjectRepository.removeStar.mockResolvedValue(mockProjectAfterRemove)

            const result = await ProjectService.toggleStar(validProjectId, userId)

            expect(result).toEqual(mockProjectAfterRemove)
            expect(ProjectRepository.removeStar).toHaveBeenCalledWith(validProjectId, userId)
            expect(ProjectRepository.addStar).not.toHaveBeenCalled()
        })

        test("Si no tiene estrella, la agregamos", async () => {
            const userId = "507f1f77bcf86cd799439062"
            const mockProject = {_id: validProjectId, starredBy: []}
            const mockProjectAfterRemove = {...mockProject, starredBy: [], stars: 1}
            ProjectRepository.getProjectById.mockResolvedValue(mockProject)
            ProjectRepository.addStar.mockResolvedValue(mockProjectAfterRemove)

            const result = await ProjectService.toggleStar(validProjectId, userId)

            expect(result).toEqual(mockProjectAfterRemove)
            expect(ProjectRepository.addStar).toHaveBeenCalledWith(validProjectId, userId)
            expect(ProjectRepository.removeStar).not.toHaveBeenCalled()
        })
    })
    describe("deleteProject", () => {
        test("deberia fallar si el project id no es un objectId valido", async () => {
            const invalidId = "invalid_project_id";

            const result = ProjectService.deleteProject(invalidId)

            await expect(result).rejects.toThrow("Invalid project Id")
            expect(ProjectRepository.getProjectById).not.toHaveBeenCalled()
            expect(ProjectRepository.deleteProject).not.toHaveBeenCalled()
        })

        test("deberia fallar si no encuentra el proyecto", async () => {
            const mockProjectId = validProjectId
            ProjectRepository.getProjectById.mockResolvedValue(null)

            const result = ProjectService.deleteProject(mockProjectId)

            await expect(result).rejects.toThrow("Project not found")
            expect(ProjectRepository.getProjectById).toHaveBeenCalledWith(mockProjectId)
            expect(ProjectRepository.deleteProject).not.toHaveBeenCalled()
        })

        test("deberia eliminar el proyecto exitosamente", async () => {
            const mockProjectId = validProjectId
            ProjectRepository.getProjectById.mockResolvedValue(mockProjectCreated)
            ProjectRepository.deleteProject.mockResolvedValue(mockProjectCreated)

            const result = await ProjectService.deleteProject(mockProjectId)

            expect(result).toEqual(mockProjectCreated)
            expect(ProjectRepository.getProjectById).toHaveBeenCalledWith(mockProjectId)
            expect(ProjectRepository.deleteProject).toHaveBeenCalledWith(mockProjectId)
        })
    })
    describe("updateProject", () => {
        test("deberia fallar si no es un objectId valido", async () => {
            // Arrange
            const invalidId = "invalid_project_id"
            const updateData = {title: "Updated title"}

            const result = ProjectService.updateProject(invalidId, updateData)

            await expect(result).rejects.toThrow("Invalid project Id")
            expect(UserRepository.getByUsername).not.toHaveBeenCalled()
            expect(UserRepository.getByEmail).not.toHaveBeenCalled()
            expect(ProjectRepository.updateProject).not.toHaveBeenCalled()
        })
        test("deberia actualizar el proyecto exitosamente sin tocar owner", async () => {
            const updateData = {title: "Nuevo titulo", description: "Nueva descripcion"}// sin owner
            const mockProjectUpdated = {...mockProjectCreated, ...updateData}
    
            ProjectRepository.updateProject.mockResolvedValue(mockProjectUpdated)
    
            const result = await ProjectService.updateProject(validProjectId, updateData)
    
            expect(result).toEqual(mockProjectUpdated)
            expect(UserRepository.getByUsername).not.toHaveBeenCalled()
            expect(UserRepository.getByEmail).not.toHaveBeenCalled()
            expect(ProjectRepository.updateProject).toHaveBeenCalledWith(validProjectId, updateData)
        })
    
        test("deberia tocar UserRepository si se actualiza el owner", async () => {
            const updateData = {owner: "nicoz45", title: "Nuevo titulo"}// Con owner
            const mockUserFound = {_id: validOwnerId, username: "nicoz45"}
            UserRepository.getByUsername.mockResolvedValue(mockUserFound)
            ProjectRepository.updateProject.mockResolvedValue({...mockProjectCreated, title: "Nuevo titulo"})
    
            const result = await ProjectService.updateProject(validProjectId, updateData)
    
            expect(UserRepository.getByUsername).toHaveBeenCalledWith("nicoz45")
            expect(ProjectRepository.updateProject).toHaveBeenCalledWith(validProjectId, expect.objectContaining({owner: validOwnerId}))
        })
    })
    describe("getProjectById", () => {
        test("deberia fallar si no es un objectId valido", async () => {
            const invalidId = "invalid_project_id"

            const result = ProjectService.getProjectById(invalidId)

            await expect(result).rejects.toThrow("Invalid project ID")
            expect(ProjectRepository.getProjectById).not.toHaveBeenCalled()
        })

        test("deria fallar si no encuentra el proyecto", async () => {
            const validId = validProjectId
            ProjectRepository.getProjectById.mockResolvedValue(null)

            const result = ProjectService.getProjectById(validId)

            await expect(result).rejects.toThrow("Project not found")
            expect(ProjectRepository.getProjectById).toHaveBeenCalledWith(validId)
        })

        test("deberia obtener el proyecto exitosamente", async () => {
            const validId = validProjectId
            ProjectRepository.getProjectById.mockResolvedValue(mockProjectCreated)

            const result = await ProjectService.getProjectById(validId)

            expect(result).toEqual(mockProjectCreated)
            expect(ProjectRepository.getProjectById).toHaveBeenCalledWith(validId)
        })
    })
    describe("getProjectByOwner", () => {
        test("deberia fallar si no hay owner", async () => {
            const projectOwner = "usuario_inexistente"
            UserRepository.getByUsername.mockResolvedValue(null)
            UserRepository.getByEmail.mockResolvedValue(null)

            const result = ProjectService.getProjectsByOwner(projectOwner)

            await expect(result).rejects.toThrow("Owner not found")
            expect(ProjectRepository.getProjectsByOwner).not.toHaveBeenCalled()
        })

        test("deberia obtener el proyecto por el owner con exito", async () => {
            const owner = "Nicoz45"
            const mockUserFound = {_id: validOwnerId,username: "Nicoz45"}
            const mockedProjects = [{_id: validProjectId, owner: validOwnerId, title: "My Portfolio"}]

            UserRepository.getByUsername.mockResolvedValue(mockUserFound)
            ProjectRepository.getProjectsByOwner.mockResolvedValue(mockedProjects)

            const result = await ProjectService.getProjectsByOwner(owner)

            expect(result).toEqual(mockedProjects)
            expect(UserRepository.getByUsername).toHaveBeenCalledWith(owner)
            expect(ProjectRepository.getProjectsByOwner).toHaveBeenCalledWith(validOwnerId)
        })
    })
    describe("getPublicProjects", () => {
        test("deberia obtener los proyectos publicos exitosamente", async () => {
            const page = 1;
        const limit = 10;
        const mockResult = {
            project: [{_id: validProjectId, title: "Mi portfolio", visibility: "public"}],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1
        }

        ProjectRepository.getPublicProjects.mockResolvedValue(mockResult)

        const result = await ProjectService.getPublicProjects(page, limit)

        expect(result).toEqual(mockResult)
        expect(ProjectRepository.getPublicProjects).toHaveBeenCalledWith(page, limit)
        })
    })
    describe("getProjectByTech", () => {
        test("deberia fallar si technology no es un string", async () => {
            const technology = [" "]

            const result = ProjectService.getProjectsByTech(technology)

            await expect(result).rejects.toThrow("Technology must be a non-empty string")
            expect(ProjectRepository.findByTechStack).not.toHaveBeenCalled()
        })
        test("deberia fallar si no se encuentra la tech", async () => {
            const technology = ""

            const result = ProjectService.getProjectsByTech(technology)

            await expect(result).rejects.toThrow("Technology must be a non-empty string")
            expect(ProjectRepository.findByTechStack).not.toHaveBeenCalled()
        })
        test("deberia devolver un array vacio si no hay proyectos con esa tecnologia", async () => {
            const technology = "Python";
            ProjectRepository.findByTechStack.mockResolvedValue([])

            const result = await ProjectService.getProjectsByTech(technology)

            expect(result).toEqual([])
            expect(ProjectRepository.findByTechStack).toHaveBeenCalledWith(technology)
        })
    })
}) 