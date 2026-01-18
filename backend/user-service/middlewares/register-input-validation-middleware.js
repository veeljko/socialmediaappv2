const StatusCodes = require("http-status-codes");
const Joi = require('joi');

const registerInputSchema = Joi.object({
    username: Joi.string().min(3).max(20).alphanum().lowercase().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(5).max(50),
})

function registerInputValidation(req, res, next){
    const {error, value} = registerInputSchema.validate(req.body, {
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
        message: 'Validation register error',
        errors: errorDetails
    });
}

module.exports = {registerInputValidation};