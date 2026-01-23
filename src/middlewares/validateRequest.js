import joi from "joi";

/**
 * Middleware de validación con joi
 * @param {joi.Schema} schema - Schema de validación joi
 * @param {Object} options - Opciones de configuración
 * @param {string} options.location - Parte del request a validar (body, params, query). Default: "body"
 * @param {number} options.statusCode - Código HTTP en caso de error. Default: 400
 * @param {boolean} options.abortEarly - Detener en primer error. Default: false
 * @param {boolean} options.stripUnknown - Eliminar campos no definidos. Default: true
 * @returns {Function} Middleware Express
 */
export const validateRequest = (schema, options = {}) => {
    const {
        location = "body",
        statusCode = 400,
        abortEarly = false,
        stripUnknown = true
    } = options;

    return (req, res, next) => {
        try {
            const dataToValidate = req[location];

            const { error, value } = schema.validate(dataToValidate, {
                abortEarly,
                stripUnknown
            });

            if (error) {
                const errorMessages = error.details.map(detail => ({
                    field: detail.path.join("."),
                    message: detail.message
                }));

                return res.status(statusCode).json({
                    ok: false,
                    message: "Validation failed",
                    status: statusCode,
                    errors: errorMessages
                })
            }

            // Reemplazar la sección del request con datos validados
            req[location] = value;
            next();
        } catch (err) {
            console.error(`Validation error in ${location}:`, err);
            return res.status(500).json({
                ok: false,
                message: "Internal validation error",
                status: 500
            });
        }
    }
}