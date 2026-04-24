import ENVIRONMENT from "../config/env.config.js"
import { ROLE_HIERARCHY } from "../constants/roles.constants.js"
import UserRepository from "../repositories/user.repository.js"
import { ServerError } from "../services/Error.service.js"
import jwt from "jsonwebtoken"

//Middleware para autenticación y autorización de usuarios
export const authenticateUser = async (req, res, next) => {
    try {
        //
        const authHeader = req.headers.authorization
        if(!authHeader || !authHeader.startsWith('Bearer')){
            throw new ServerError(401, "There is no session header")
        }

        // Extraemos el token del encabezado de autorización, asumiendo que el formato es "Bearer <token>"
        // El token es la segunda parte después de "Bearer"
        // Toma el valor del encabezado de autorización, lo divide por espacios y toma la segunda parte (el token)
        // Lo guarda en la variable auth_token para su posterior uso en la verificación del token y la autenticación del usuario
        const authToken = authHeader.split(' ')[1]
        if(!authToken){
            throw new ServerError(401, "There is no session token")
        }

        const payload = jwt.verify(authToken, ENVIRONMENT.JWT_SECRET)

        const { user_id } = payload || {}
        if(!user_id){
            throw new ServerError(401, "Invalid token payload")
        }

        const userSessionData = await UserRepository.getById(user_id)

        if(!userSessionData || !userSessionData.active){
            throw new ServerError(401, "Invalid or inactive user")
        }

        // Adjuntamos usuario completo a la request
        req.user = userSessionData
        return next()

    } catch (error) {
        if(error instanceof jwt.JsonWebTokenError){
            return res.status(400).json({
                ok: false,
                message: "invalid token",
                status: 400
            })
        }
        else if(error instanceof jwt.TokenExpiredError){
            return res.status(401).json({
                ok: false,
                message: "Expired token",
                status: 401
            })
        }
        else if(error.status){
            return res.status(error.status).json({
                ok: false,
                message: error.message,
                status: error.status
            })
        }
        else{
            console.error('ERROR OBTAINING THE TOKEN ', error)
            return res.status(500).json({
                ok: false,
                message: "Internal server error",
                status: 500
            })
        }
    }
}


//Middleware para verificar roles especificos

export const requireRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user){
            return res.status(401).json({
                ok: false,
                message: "Authentication required",
                status: 401
            })
        }
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                ok: false,
                message: "Insufficient permissions",
                requiredRoles: allowedRoles,
                yourRole: req.user.role,
                status: 403
            })
        }
        next()
    }
}


//Middleware para verificar jerarquia de roles
export const requiredMinRole = (minRole) => {
    return (req, res, next) => {
        if(!req.user){
            return res.status(401).json({
                ok: false,
                message: "Authentication required",
                status: 401
            })
        }
        const userRoleLevel = ROLE_HIERARCHY[req.user.role]
        const requiredRoleLevel = ROLE_HIERARCHY[minRole]

        if(userRoleLevel < requiredRoleLevel){
            return res.status(403).json({
                ok: false,
                message: "Unauthorized user, Insufficient permission",
                requiredMinRole: minRole,
                yourRole: req.user.role
            })
        }
        return next()
    }

}

//Middleware para verificar propiedad o rol elevado
export const isOwnerOrRole = (resourceOwnerField, ...allowedRoles) => {
    return async (req, res, next) => {
        try {
            if(!req.user){
            return res.status(401).json({
                ok: false,
                message: "Authentication required",
                status: 401
            })
        }
        //Si tiene un rol permitido, puede continuar
        if(allowedRoles.includes(req.user.role)){
            return next()
        }
        // Verificar propiedad del recurso
        const resource = req.resource

        if(!resource){
            return res.status(404).json({
                ok: false,
                message: "Resource not found",
                status: 404
            })
        }

        const ownerId = resource[resourceOwnerField]
        if(!ownerId){
            return res.status(403).json({
                ok: false,
                message: "Resource has no owner field",
                status: 403
            })
        }

        if(String(ownerId) !== String(req.user._id)){
            return res.status(403).json({
                ok: false,
                message: "You can only modify your own resource",
                status: 403
            })
        }
        next()

        } catch (error) {
            next(error)
        }
    }
}

//Middleware para verificar email verificado
export const requiredVerifiedEmail = (req, res, next) => {
    if(!req.user){
        return res.status(401).json({
            ok: false,
            message: "Authentication required",
            status: 401
        })
    }

    if(!req.user.verified_email){
        return res.status(403).json({
            ok: false,
            message: "Please verify your email before performing this action",
            status: 403
        })
    }

    return next()
}