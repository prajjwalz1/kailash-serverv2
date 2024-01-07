const createError = require('http-errors')
const Category = require('../models/category.model')
const  {categorySchema} = require('../helpers/validationSchema')


module.exports = {
    register: async (req,res) =>{
        try {
            console.log(res.locals.payload)
            req.body["organization_id"] = res.locals.payload.organization
            console.log(req.body)
            const isValidated = await categorySchema.validateAsync(req.body)
            const doesExists = await Category.findOne({ name: req.body.name, organization_id: res.locals.payload.organization, deleted_at:null })
            if (doesExists) throw createError.Conflict(`${req.body.name} is already Used`)
            const category = new Category(isValidated)
            const newCategory = await category.save()
            return res.status(201).json(newCategory)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
                return res.status(400).json({message: error.message})
        }
    },
    get_category: async (req,res) => {
        try {
            let category = await Category.find({ organization_id: res.locals.payload.organization,deleted_at:null })
            return res.status(201).json(category)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
                return res.status(400).json({message: error.message})
        }
    },
    delete_category: async (req,res) => {
        try {
            let deleteCategory = await Category.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": { "deleted_at": Date.now() } } )
            return res.status(201).json(deleteCategory)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
                return res.status(400).json({message: error.message})
        }

    }
}