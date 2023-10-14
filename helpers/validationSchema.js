const Joi = require("@hapi/joi")
const authSchema= Joi.object({
    email : Joi.string().email().lowercase().required(),
    username: Joi.string().min(2),
    password: Joi.string().min(2).required()

})

module.exports= {
    authSchema
}