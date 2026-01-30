const StatusCodes = require("http-status-codes");
const Joi = require('joi');

const loginInputSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(5).max(50),
})

function loginInputValidation(req, res, next){
    const {error, value} = loginInputSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        errors: {
            wrap: {
                label: false
            }
        }
    });
    if (!error) {
        req.body = value;
        return next();
    }

    const errorDetails = error.details.map(detail => ({
        path: detail.path.join('.'),
        message: detail.message
    }));

    return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Validation login error',
        errors: errorDetails
    });
}

module.exports = {loginInputValidation};