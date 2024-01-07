const createError = require('http-errors')
const Product = require('../models/product.model')
const  {productSchema} = require('../helpers/validationSchema')
const History = require('../models/history.model')
const mongoose = require("mongoose")
const moment = require('moment')

module.exports = {
    /*
    customActions:async (req,res) =>{
        try {
            let total = 0
            let stock = 0
            let product = await Product.findById(req.body.product_id,{past_history:0,created_at:0,updated_at:0})
            if(req.body.type === 'update' && product){
                let warehouseFound = product.warehouses.findIndex(i=>i.warehouse ==req.body.warehouse_start)
                if(warehouseFound>=0){
                    product.warehouses[warehouseFound].stock_count += parseInt(req.body.stock_count)
                    product.warehouses[warehouseFound].total_amount += parseInt(req.body.total_amount)
                }
                else {
                    let ware = {
                        warehouse:req.body.warehouse_start,
                        total_amount:req.body.total_amount,
                        stock_count:req.body.stock_count,
                        retail_price:req.body.retail_price,
                        reorder_point:10
                    }
                    product.warehouses.push(ware)
                }
                let editProduct = await Product.updateOne( { _id: req.body.product_id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": product } )
                let dat = {
                    warehouse: req.body.warehouse_start,
                    stock_count:req.body.stock_count,
                    retail_price:req.body.retail_price,
                    total_amount:req.body.total_amount,
                    product_id:product._id,
                    category:product.category,
                    added_on:Date.now(),
                    type:"Data Added To Existing"
                }
                const history = new History(dat)
                const newHistory = await history.save()
            }
            else if(req.body.type === 'transfer' && product){
                let findStart = product.warehouses.findIndex(i=>i.warehouse == req.body.warehouse_start)
                if(findStart<0){
                    return res.status(500).json({message: "Starting Warehouse has no product"})
                }
                else {
                    if(req.body.stock_count>product.warehouses[findStart].stock_count && req.body.total_amount>product.warehouses[findStart].total_amount){
                        return res.status(500).json({message: "Stock amount more than warehouse stock's amount"})
                    }
                    else {
                        product.warehouses[findStart].stock_count -= parseInt(req.body.stock_count)
                        product.warehouses[findStart].total_amount -= parseInt(req.body.total_amount)
                    }
                }
                let findEnd = product.warehouses.findIndex(j=>j.warehouse == req.body.warehouse_end)
                if(findEnd<0){
                    let ware = {
                        warehouse:req.body.warehouse_end,
                        total_amount:req.body.total_amount,
                        stock_count:req.body.stock_count,
                        retail_price:req.body.retail_price,
                        reorder_point:10
                    }
                    product.warehouses.push(ware)
                }
                else {
                    product.warehouses[findEnd].stock_count += parseInt(req.body.stock_count)
                    product.warehouses[findEnd].total_amount += parseInt(req.body.total_amount)
                }
                let dat = {
                    warehouse: req.body.warehouse_start,
                    stock_count:req.body.stock_count,
                    retail_price:req.body.retail_price,
                    total_amount:req.body.total_amount,
                    category:product.category,
                    product_id: product._id,
                    added_on:Date.now(),
                    type:"Transferred Data"
                }
                const history = new History(dat)
                const newHistory = await history.save()
            }
            for(let item in product.warehouses){
                total += parseInt(product.warehouses[item].total_amount)
                stock += parseInt(product.warehouses[item].stock_count)
            }
            product["total_stock"] = stock
            product["total_amount"] = total
            let editProduct = await Product.updateOne( { _id: req.body.product_id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": product } )
            return res.status(201).json(req.body)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    */
    register: async (req,res) =>{
        try {
            req.body["organization_id"] = res.locals.payload.organization
            let warehouses = []
            let sites = []
            let groups = []
            let total = 0
            let stock = 0
            console.log(req.body)
            for(let i=0;i<req.body.warehouses.length;i++){
                if(warehouses.includes(req.body.warehouses[i].warehouse)){
                    return res.status(500).json({message: "Same warehouse added for 2 times"})
                }
                warehouses.push(req.body.warehouses[i].warehouse)
                total += parseInt(req.body.warehouses[i].total_amount)
                stock += parseInt(req.body.warehouses[i].stock_count)
            }
            for(let i=0;i<req.body.sites.length;i++){
                if(warehouses.includes(req.body.sites[i].site)){
                    return res.status(500).json({message: "Same site added for 2 times"})
                }
                sites.push(req.body.sites[i].site)
                total += parseInt(req.body.sites[i].total_amount)
                stock += parseInt(req.body.sites[i].stock_count)
            }
            for(let i=0;i<req.body.groups.length;i++){
                if(groups.includes(req.body.groups[i].group)){
                    return res.status(500).json({message: "Same group added for 2 times"})
                }
                groups.push(req.body.groups[i].group)
                total += parseInt(req.body.groups[i].total_amount)
                stock += parseInt(req.body.groups[i].stock_count)
            }
            req.body["total_stock"] = stock
            req.body["total_amount"] = total
            const isValidated = await productSchema.validateAsync(req.body)
            const doesExists = await Product.findOne({ name: req.body.name, organization_id: res.locals.payload.organization, deleted_at:null })
            if (doesExists) throw createError.Conflict(`${req.body.name} is already Used`)
            const product = new Product(isValidated)
            const newProduct = await product.save()
            console.log(req.body)
            for(let i=0;i<req.body.warehouses.length;i++){
                let dat = {
                    organization_id:res.locals.payload.organization,
                    warehouse: req.body.warehouses[i].warehouse,
                    supplier: req.body.warehouses[i].supplier[0],
                    stock_count: req.body.warehouses[i].stock_count,
                    retail_price: req.body.warehouses[i].retail_price,
                    total_amount: req.body.warehouses[i].total_amount,
                    product_id: newProduct._id,
                    added_by:res.locals.payload.name,
                    category: newProduct.category,
                    added_on: Date.now(),
                    type: "Newly Added"
                }
                const history = new History(dat)
                const newHistory = await history.save()
            }
            for(let i=0;i<req.body.groups.length;i++){
                let dat = {
                    organization_id:res.locals.payload.organization,
                    group: req.body.groups[i].group,
                    supplier: req.body.groups[i].supplier[0],
                    stock_count: req.body.groups[i].stock_count,
                    retail_price: req.body.groups[i].retail_price,
                    total_amount: req.body.groups[i].total_amount,
                    product_id: newProduct._id,
                    added_by:res.locals.payload.name,
                    category: newProduct.category,
                    added_on: Date.now(),
                    type: "Newly Added"
                }
                const history = new History(dat)
                const newHistory = await history.save()
            }
            for(let i=0;i<req.body.sites.length;i++){
                let dat = {
                    organization_id:res.locals.payload.organization,
                    site: req.body.sites[i].site,
                    supplier: req.body.sites[i].supplier[0],
                    stock_count: req.body.sites[i].stock_count,
                    retail_price: req.body.sites[i].retail_price,
                    total_amount: req.body.sites[i].total_amount,
                    product_id: newProduct._id,
                    added_by:res.locals.payload.name,
                    category: newProduct.category,
                    added_on: Date.now(),
                    type: "Newly Added"
                }
                const history = new History(dat)
                const newHistory = await history.save()
            }
            return res.status(201).json(newProduct)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_product: async (req,res) => {
        try{
            let totalItem = await Product.countDocuments({organization_id:{$eq:res.locals.payload.organization},deleted_at:null})
            console.log(totalItem)
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
            let products = await Product.find({organization_id:{$eq:res.locals.payload.organization},deleted_at:null},{past_history:0}).sort("-created_at").populate('brand category supplier warehouses.warehouse warehouses.supplier groups.group groups.supplier sites.site sites.supplier',{name:1,_id:1}).skip(skip).limit(perPage)
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
    get_product_history: async (req,res) => {
        try{
            console.log(req.params)
            let totalItem = await History.countDocuments({product_id:req.params.id,organization_id:{$eq:res.locals.payload.organization},deleted_at:null})
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
            let products = await History.find({product_id:req.params.id,organization_id:{$eq:res.locals.payload.organization},deleted_at:null}).sort({"added_on":-1}).populate('warehouse warehouse_end supplier site site_end group group_end product_id',{name:1,_id:1}).skip(skip).limit(perPage)
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
    get_product_supplier_history: async (req,res) => {
        try{
            let totalItem = await History.countDocuments({product_id:req.params.id,organization_id:{$eq:res.locals.payload.organization},deleted_at:null,supplier: { $ne: null } })
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
            let products = await History.find({product_id:req.params.id,organization_id:{$eq:res.locals.payload.organization},deleted_at:null,supplier: { $ne: null }}).sort({"added_on":-1}).populate('warehouse warehouse_end supplier site site_end group group_end product_id',{name:1,_id:1}).skip(skip).limit(perPage)
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
    get_product_for_sales: async (req,res) => {
        try{
            let totalItem = await Product.countDocuments({organization_id:{$eq:res.locals.payload.organization},deleted_at:null})
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
            let products = await Product.find({organization_id:{$eq:res.locals.payload.organization},deleted_at:null},{past_history:0}).sort("-created_at").populate('brand category supplier warehouses.warehouse',{name:1,_id:1}).skip(skip).limit(perPage)
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
    get_products_by_id: async (req,res) => {
        try {
            let query = req.params.id.toString()
            let data = await Product.findById(query,{past_history:0})
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
    search_products: async (req,res) => {
        try {
            let query = req.params.query.toString()
            let products = await Product.find({ organization_id:{$eq:res.locals.payload.organization},deleted_at:null, "name": { "$regex": query, "$options": "i" } },{past_history:0}).populate('brand category supplier warehouses.warehouse',{name:1,_id:1}).limit(12)
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
    search_products_for_sales: async (req,res) => {
        try {
            let query = req.params.query.toString()
            let products = await Product.find({ organization_id:{$eq:res.locals.payload.organization},deleted_at:null, "name": { "$regex": query, "$options": "i" } },{past_history:0}).populate('brand category supplier warehouses.warehouse',{name:1,_id:1}).limit(12)
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
    edit_product: async (req,res) => {
        try {
            req.body["organization_id"] = res.locals.payload.organization
            let history = []
            let total = 0
            let stock = 0
            for(let j=0;j<req.body.warehouses.length;j++){
                total += parseInt(req.body.warehouses[j].total_amount)
                stock += parseInt(req.body.warehouses[j].stock_count)
            }
            req.body["total_stock"] = stock
            req.body["total_amount"] = total
            let editProduct = await Product.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": req.body } )
            let product = await Product.findById(req.params.id)
            for(let i=0;i<req.body.warehouses.length;i++){
                let dat = {
                    warehouse: req.body.warehouses[i].warehouse,
                    stock_count:req.body.warehouses[i].stock_count,
                    retail_price:req.body.warehouses[i].retail_price,
                    total_amount:req.body.warehouses[i].total_amount,
                    category:req.body.category,
                    type:"Editted Data"
                }
                let historyUpdate = await Product.updateOne(
                    { _id: req.params.id },
                    { $push: { past_history: dat } }
                )
            }
            return res.status(201).json(editProduct)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    delete_product: async (req,res) => {
        try {
            let deleteProduct = await Product.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": { "deleted_at": Date.now() } } )
            return res.status(201).json(deleteProduct)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }

    }
}