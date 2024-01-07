const createError = require('http-errors')
const Group = require('../models/groups.model')
const History = require('../models/history.model')
const  {groupsSchema} = require('../helpers/validationSchema')


module.exports = {
    register: async (req,res) =>{
        try {
            req.body["organization_id"] = res.locals.payload.organization
            const isValidated = await groupsSchema.validateAsync(req.body)
            const doesExists = await Group.findOne({ name: req.body.name, organization_id: res.locals.payload.organization, deleted_at:null })
            if (doesExists) throw createError.Conflict(`${req.body.name} is already Used`)
            const supplier = new Group(isValidated)
            const newSupplier = await supplier.save()
            return res.status(201).json(newSupplier)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_groups: async (req,res) => {
        try{
            let totalItem = await Group.countDocuments({organization_id:{$eq:res.locals.payload.organization},deleted_at:null})
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
            let products = await Group.find({organization_id:{$eq:res.locals.payload.organization},deleted_at:null}).populate('paid_history.added_by',{full_name:1,_id:1}).skip(skip).limit(perPage)
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
    search_groups: async (req,res) => {
        try {
            let query = req.params.query.toString()
            let products = await Group.find({ organization_id:{$eq:res.locals.payload.organization},deleted_at:null, "name": { "$regex": query, "$options": "i" } }).populate('paid_history.added_by',{full_name:1,_id:1}).limit(12)
            return res.status(201).json({
                data:products,
                currentPage:1,
                totalPage:1
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    edit_group: async (req,res) => {
        try {
            req.body["organization_id"] = res.locals.payload.organization
            delete req.body["paid_history"]
            let deleteSupplier = await Group.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": req.body } )
            return res.status(201).json(deleteSupplier)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_groups_by_id: async (req,res) => {
        try {
            let query = req.params.id.toString()
            let data = await Group.findById(query)
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
    get_groups_inventory_history: async (req,res) => {
        try{
            let totalItem = await History.countDocuments({$or:[
                    {group:req.params.id},
                    {group_end:req.params.id},
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
                    {group:req.params.id},
                    {group_end:req.params.id},
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
    delete_group: async (req,res) => {
        try {
            let deleteSupplier = await Group.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": { "deleted_at": Date.now() } } )
            return res.status(201).json(deleteSupplier)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }

    }
}