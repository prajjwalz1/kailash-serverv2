const createError = require('http-errors')
const Organization = require('../models/organization.model')
const  {organizationSchema} = require('../helpers/validationSchema')


module.exports = {
    register: async (req,res,next) =>{
        try {
            const isValidated = await organizationSchema.validateAsync(req.body)
            const doesExists = await Organization.findOne({ username: req.body.username })
            if (doesExists) throw createError.Conflict(`${req.body.username} is already Used`)
            const org = new Organization(isValidated)
            org.save()
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    }
}