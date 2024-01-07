const createError = require('http-errors')
const Receipt = require('../models/receipts.model')
const  {receiptSchema} = require('../helpers/validationSchema')


module.exports = {
    register: async (req,res) =>{
        try {
            console.log(req.body)
            req.body["organization_id"] = res.locals.payload.organization
            const isValidated = await receiptSchema.validateAsync(req.body)
            const doesExists = await Receipt.findOne({ name: req.body.name, organization_id: res.locals.payload.organization, deleted_at:null })
            if (doesExists) throw createError.Conflict(`${req.body.name} is already Used`)
            const supplier = new Receipt(isValidated)
            const newReceipt = await supplier.save()
            return res.status(201).json(newReceipt)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_receipt: async (req,res) => {
        try{
            let totalItem = await Receipt.countDocuments({organization_id:{$eq:res.locals.payload.organization},deleted_at:null})
            if(totalItem <=0){
                return res.status(201).json({
                    data:[],
                    currentPage:1,
                    totalPage:1
                })
            }
            let perPage = 12
            let skip = perPage * parseInt(req.params.page)
            let totalPage = totalItem/perPage
            let page = totalPage % perPage === 0 ? parseInt(totalPage) : parseInt(totalPage + 1)
            if(parseInt(req.params.page) >= parseInt(page)){
                return res.status(400).json({message: "Invalid Page"})
            }
            let products = await Receipt.find({ organization_id: res.locals.payload.organization,deleted_at:null }).populate('supplier',{name:1,_id:1}).skip(skip).limit(perPage)
            return res.status(201).json({
                data:products,
                currentPage:parseInt(req.params.page)+1,
                totalPage:parseInt(page)
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    search_receipt: async (req,res) => {
        try {
            try {
                let query = req.params.query.toString()
                let products = await Receipt.find({ organization_id:{$eq:res.locals.payload.organization},deleted_at:null }).populate('supplier',{name:1,_id:1}).find({$or:[
                        { "name": { "$regex": query, "$options": "i" }},
                        { "supplier.name": { "$regex": query, "$options": "i" }}
                    ]}).limit(12)
                return res.status(201).json({
                    data:products,
                    currentPage:1,
                    totalPage:1
                })
            } catch (error) {
                if (error.isJoi === true) error.status = 422
                return res.status(400).json({message: error.message})
            }

        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_receipt_by_id: async (req,res) => {
        try {
            let query = req.params.id.toString()
            let data = await Receipt.findById(query,{past_history:0})
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
    edit_receipt: async (req,res) => {
        try {
            req.body["organization_id"] = res.locals.payload.organization
            let deleteReceipt = await Receipt.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": req.body } )
            return res.status(201).json(deleteReceipt)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    delete_receipt: async (req,res) => {
        try {
            let deleteReceipt = await Receipt.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": { "deleted_at": Date.now() } } )
            return res.status(201).json(deleteReceipt)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }

    }
}