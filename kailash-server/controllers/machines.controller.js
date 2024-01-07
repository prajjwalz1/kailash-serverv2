const createError = require('http-errors')
const Machine = require('../models/machines.model')
const  {machineSchema} = require('../helpers/validationSchema')


module.exports = {
    register: async (req,res) =>{
        try {
            console.log(req.body)
            req.body["organization_id"] = res.locals.payload.organization
            const isValidated = await machineSchema.validateAsync(req.body)
            const supplier = new Machine(isValidated)
            const newMachine = await supplier.save()
            return res.status(201).json(newMachine)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_machine: async (req,res) => {
        try {
            let supplier = await Machine.find({ organization_id: res.locals.payload.organization,deleted_at:null }).populate({
                path: 'salesHistory',
                populate: {
                    path: 'added_by',
                    model: 'user'
                }
            })
            return res.status(201).json(supplier)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_machine_by_id: async (req,res) => {
        try {
            let query = req.params.id.toString()
            let data = await Machine.findById(query,{past_history:0})
            if(data.organization_id == res.locals.payload.organization && data.deleted_at === null){
                return res.status(201).json(data)
            }
            else {
                return res.status(400).json({message: "You do not have the permissions to access the info"})
            }

        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    edit_machine: async (req,res) => {
        try {
            req.body["organization_id"] = res.locals.payload.organization
            delete req.body["salesHistory"]
            let deleteMachine = await Machine.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": req.body } )
            return res.status(201).json(deleteMachine)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    delete_machine: async (req,res) => {
        try {
            let deleteMachine = await Machine.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": { "deleted_at": Date.now() } } )
            return res.status(201).json(deleteMachine)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }

    }
}