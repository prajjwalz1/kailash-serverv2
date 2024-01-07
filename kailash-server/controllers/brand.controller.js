const createError = require('http-errors')
const Brand = require('../models/brand.model')
const  {brandSchema} = require('../helpers/validationSchema')


module.exports = {
    register: async (req,res) =>{
        try {
            console.log(req.body)
            req.body["organization_id"] = res.locals.payload.organization
            const isValidated = await brandSchema.validateAsync(req.body)
            const doesExists = await Brand.findOne({ name: req.body.name, organization_id: res.locals.payload.organization, deleted_at:null })
            if (doesExists) throw createError.Conflict(`${req.body.name} is already Used`)
            const brand = new Brand(isValidated)
            const newBrand = await brand.save()
            return res.status(201).json(newBrand)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_Brand: async (req,res) => {
        try {
            let brand = await Brand.find({ organization_id: res.locals.payload.organization,deleted_at:null })
            return res.status(201).json(brand)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    delete_Brand: async (req,res) => {
        try {
            let deleteBrand = await Brand.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": { "deleted_at": Date.now() } } )
            return res.status(201).json(deleteBrand)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }

    }
}