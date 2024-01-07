const createError = require('http-errors')
const Warehouse = require('../models/warehouse.model')
const History = require('../models/history.model')
const  {warehouseSchema} = require('../helpers/validationSchema')


module.exports = {
    register: async (req,res) =>{
        try {
            req.body["organization_id"] = res.locals.payload.organization
            const isValidated = await warehouseSchema.validateAsync(req.body)
            const wHouse = new Warehouse(isValidated)
            const newWarehouse = await wHouse.save()
            return res.status(201).json(newWarehouse)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_Warehouse: async (req,res) => {
        try{
            let totalItem = await Warehouse.countDocuments({organization_id:{$eq:res.locals.payload.organization},deleted_at:null})
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
            let Warehouses = await Warehouse.find({organization_id:{$eq:res.locals.payload.organization},deleted_at:null}).populate('warehouse_owner',{full_name:1, _id:1, email:1}).skip(skip).limit(perPage)
            return res.status(201).json({
                data:Warehouses,
                currentPage:parseInt(req.params.page)+1,
                totalPage:parseInt(page)
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_all_Warehouse: async (req,res) => {
        try{
            let Warehouses = await Warehouse.find({organization_id:{$eq:res.locals.payload.organization},deleted_at:null}).populate('warehouse_owner',{full_name:1, _id:1, email:1})
            return res.status(201).json(Warehouses)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_Warehouses_by_id: async (req,res) => {
        try {
            let query = req.params.id.toString()
            let data = await Warehouse.findById(query)
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
    search_Warehouses: async (req,res) => {
        try {
            let query = req.params.query.toString()
            let Warehouses = await Warehouse.find({ organization_id:{$eq:res.locals.payload.organization},deleted_at:null, "name": { "$regex": query, "$options": "i" } }).populate('warehouse_owner',{full_name:1, _id:1, email:1}).limit(12)
            return res.status(201).json({
                data:Warehouses,
                currentPage:1,
                totalPage:1
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_warehouses_inventory_history: async (req,res) => {
        try{
            let totalItem = await History.countDocuments({$or:[
                    {warehouse:req.params.id},
                    {warehouse_end:req.params.id},
                ],organization_id:{$eq:res.locals.payload.organization},deleted_at:null})
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
                    {warehouse:req.params.id},
                    {warehouse_end:req.params.id},
                ]}).sort({"added_on":-1}).populate('warehouse warehouse_end supplier site site_end group group_end product_id',{name:1,_id:1}).skip(skip).limit(perPage)
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
    edit_Warehouse: async (req,res) => {
        try {
            req.body["organization_id"] = res.locals.payload.organization
            let editWarehouse = await Warehouse.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": req.body } )
            return res.status(201).json(editWarehouse)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    delete_Warehouse: async (req,res) => {
        try {
            let deleteWarehouse = await Warehouse.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": { "deleted_at": Date.now() } } )
            return res.status(201).json(deleteWarehouse)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }

    }
}