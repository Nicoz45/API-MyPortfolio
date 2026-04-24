import { ROLES } from "../constants/roles.constants.js"
import projectRepository from "../repositories/project.repository.js"


export const loadProject = async (req, res, next) => {
    try {
        const projectId = req.params.id || req.params.projectId
        const project = await projectRepository.getProjectById(projectId)

        if(!project){
            return res.status(404).json({
                ok: false,
                message: "Project not found",
                status: 404
            })
        }

        req.project = project
        next()
    } catch (error) {
        next(error)
    }

}

export const canViewProject = async (req, res, next) => {
    if(!req.project){
        return res.status(404).json({
            ok: false,
            message: "Project not found",
            status: 404
        })
    }

    //Proyectos publicos; cualquiera puede ver
    if(req.project.visibility === "public"){
        return next()
    }

    //Proyectos privados; solo owner, mods y admin
    if(!req.user){
        return res.status(401).json({
            ok: false,
            message: "Authentication required to view private projects",
            status: 401
        })
    }

    const isOwner = req.project.owner.toString() === req.user._id.toString()
    const isModOrAdmin = [ROLES.MOD, ROLES.ADMIN].includes(req.user.role)

    if(!isOwner && !isModOrAdmin){
        return res.status(403).json({
            ok: false,
            message: "You don't have permission to view this private project"
        })
    }

    next()
}

export const canModifyProjet = async (req, res, next) => {
    if(!req.project){
        return res.status(404).json({
            ok: false,
            message: "Project not found",
            status: 404
        })
    }

    if(!req.user){
        return res.status(401).json({
            ok: false,
            message: "Authentication required",
            status: 401
        })
    }

    const isOwner = req.project.owner.toString() === req.user._id.toString()
    const isAdmin = req.user.role === ROLES.ADMIN

    if(!isOwner && !isAdmin){
        return res.status(403).json({
            ok: false,
            message: "You can only modify your own projects"
        })
    }
    return next()
}

export const checkProjectLimits = async (req, res, next) => {
    try {
        const canCreate = await req.user.canCreateProject()

        if(!canCreate){
            const limits = req.user.getRoleLimits()
            return res.status(403).json({
                ok: false,
                message: `You have reached the limit of your projects. ${limits.maxProjects}`,
                suggestion: "Consider upgrade to premium for more projects"
            })
        }

        // Si el proyecto es privado, verificar limite
        if(req.body.visibility === 'private'){
            const canCreatePrivate = await req.user.canCreatePrivateProject()
            if(!canCreatePrivate){
                const limits = req.user.getRoleLimits()
            return res.status(403).json({
                ok: false, 
                message: `You have reached your private project limit. ${limits.maxPrivateProjects}`,
                suggestion: "Consider upgrade to premium for more private projects"
            })
            }
        }
        next()
    } catch (error) {
        next(error)
    }
}