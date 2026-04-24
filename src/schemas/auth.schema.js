import joi from "joi";

export const registerSchema = joi.object({
    email: joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'es'] } })
        .required()
        .messages({
            'string.email': 'Email must be a valid email address',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),
    username: joi.string()
        .min(4)
        .max(30)
        .required()
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/)
        .messages({
            'string.min': 'username must be at least 4 characters long',
            'string.max': 'username must be at most 30 characters long',
            'string.pattern.base': 'username can only contain letters, numbers and spaces',
            'string.empty': 'username is required',
            'any.required': 'username is required'
        }),
    password: joi.string()
        .min(8)
        .max(200)
        .required(true)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password must be at most 200 characters long',
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        }),
    repeatPassword: joi.string()
        .required()
        .valid(joi.ref('password'))
        .messages({
            'any.only': 'Passwords do not match',
            'string.empty': 'Please confirm your password',
            'any.required': 'Password confirmation is required'
        })
})

export const loginSchema = joi.object({
    emailOrUsername: joi.alternatives().try(
        joi.string().trim().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'es'] } }),
        joi.string().trim().min(4).max(30).pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/)
    )
        .required()
        .messages({
            'alternative.match': 'Enter a valid email or username',
            'string.empty': 'Email or username is required',
            'any.required': 'Email or username is required'
        }),
    password: joi.string()
        .required()
        .messages({
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        })
})

