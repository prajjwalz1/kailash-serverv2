const createError = require('http-errors')
const Site = require('../models/site.model.js')
const History = require('../models/history.model')
const  {siteSchema} = require('../helpers/validationSchema')


module.exports = {
    register: async (req,res) =>{
        try {
            req.body["organization_id"] = res.locals.payload.organization
            const isValidated = await siteSchema.validateAsync(req.body)
            const site = new Site(isValidated)
            const newSite = await site.save()
            return res.status(201).json(newSite)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_Site: async (req,res) => {
        try{
            let totalItem = await Site.countDocuments({organization_id:{$eq:res.locals.payload.organization},deleted_at:null})
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
            let Sites = await Site.find({organization_id:{$eq:res.locals.payload.organization},deleted_at:null}).skip(skip).limit(perPage)
            return res.status(201).json({
                data:Sites,
                currentPage:parseInt(req.params.page)+1,
                totalPage:parseInt(page)
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_all_Site: async (req,res) => {
        try{
            let Sites = await Site.find({organization_id:{$eq:res.locals.payload.organization},deleted_at:null})
            return res.status(201).json(Sites)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_sites_inventory_history: async (req,res) => {
        try{
            let totalItem = await History.countDocuments({$or:[
                    {site:req.params.id},
                    {site_end:req.params.id},
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
                    {site:req.params.id},
                    {site_end:req.params.id},
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
    get_Sites_by_id: async (req,res) => {
        try {
            let query = req.params.id.toString()
            let data = await Site.findById(query)
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
    search_Sites: async (req,res) => {
        try {
            let query = req.params.query.toString()
            let Sites = await Site.find({ organization_id:{$eq:res.locals.payload.organization},deleted_at:null, "name": { "$regex": query, "$options": "i" } }).limit(12)
            return res.status(201).json({
                data:Sites,
                currentPage:1,
                totalPage:1
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    edit_Site: async (req,res) => {
        try {
            req.body["organization_id"] = res.locals.payload.organization
            let editSite = await Site.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": req.body } )
            return res.status(201).json(editSite)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    delete_Site: async (req,res) => {
        try {
            let deleteSite = await Site.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": { "deleted_at": Date.now() } } )
            return res.status(201).json(deleteSite)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }

    }
}