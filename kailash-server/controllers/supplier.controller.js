const createError = require('http-errors')
const Supplier = require('../models/supplier.model')
const History = require('../models/history.model')
const  {supplierSchema} = require('../helpers/validationSchema')


module.exports = {
    register: async (req,res) =>{
        try {
            console.log(req.body)
            req.body["organization_id"] = res.locals.payload.organization
            const isValidated = await supplierSchema.validateAsync(req.body)
            const doesExists = await Supplier.findOne({ name: req.body.name, organization_id: res.locals.payload.organization, deleted_at:null })
            if (doesExists) throw createError.Conflict(`${req.body.name} is already Used`)
            const supplier = new Supplier(isValidated)
            const newSupplier = await supplier.save()
            return res.status(201).json(newSupplier)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_supplier_inventory_history: async (req,res) => {
        try{
            let totalItem = await History.countDocuments({$or:[
                    {type:"Data Added To Existing"},
                    {type:"Newly Added"},
                ],supplier:{$eq:req.params.id},organization_id:{$eq:res.locals.payload.organization},deleted_at:null})
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
            let products = await History.find({$or:[
                    {type:"Data Added To Existing"},
                    {type:"Newly Added"},
                ],supplier:{$eq:req.params.id},organization_id:{$eq:res.locals.payload.organization},deleted_at:null}).sort({"added_on":-1}).populate('warehouse warehouse_end supplier site site_end group group_end product_id',{name:1,_id:1}).skip(skip).limit(perPage)
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
    get_supplier: async (req,res) => {
        try {
            let supplier = await Supplier.find({ organization_id: res.locals.payload.organization,deleted_at:null }).populate('paid_history.added_by',{full_name:1,_id:1})
            return res.status(201).json(supplier)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    edit_supplier: async (req,res) => {
        try {
            req.body["organization_id"] = res.locals.payload.organization
            let deleteSupplier = await Supplier.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": req.body } )
            return res.status(201).json(deleteSupplier)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    delete_supplier: async (req,res) => {
        try {
            let deleteSupplier = await Supplier.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": { "deleted_at": Date.now() } } )
            return res.status(201).json(deleteSupplier)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    }
}