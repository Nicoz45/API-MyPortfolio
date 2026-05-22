import joi from "joi";

export const createProjectSchema = joi.object({
    title: joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min' : 'Title must be at least 3 characters long',
            'string.max' : 'Title must be at most 100 characters long',
            'string.empty' : 'Title is required'
        }),
    description: joi.string()
        .max(2000)
        .allow('', null)
        .messages({
            'string.max': 'Description must be at most 2000 characters long'
        }),
    techStack: joi.array()
        .items(joi.string().min(1).max(50))
        .max(20)
        .messages({
            'array.max': 'Maximun 20 technologies allowed',
            'string.max': 'Each technology must be at most 50 characters long',
            'string.min': 'Each technology must be at least 1 character long'
        }),
    repositoryLink: joi.string()
        .uri()
        .allow('', null)
        .messages({
            'string.uri': 'Repository link must be a valid URL'
        }),
    liveDemoLink: joi.string()
        .uri()
        .allow('', null)
        .messages({
            'string.uri': 'Live demo link must be a valid URL'
        }),
    visibility: joi.string()
        .valid('public', 'private')
        .default('public')
})

export const updateProjectSchema = joi.object({
    title: joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min' : 'Title must be at least 3 characters long',
            'string.max' : 'Title must be at most 100 characters long',
        }),
    description: joi.string()
        .max(2000)
        .allow('', null),
    techStack: joi.array()
        .items(joi.string().min(1).max(50))
        .max(20),
    repositoryLink: joi.string()
        .uri()
        .allow('', null),  
    liveDemoLink: joi.string()
        .uri()
        .allow('', null),  
    visibility: joi.string()
        .valid('public', 'private')
}).min(1) // Require at least one field to update(al menos un campo para actualizar)