const createError = require('http-errors')
const Sales = require('../models/sales.model')
const {salesSchema, approvalSchema} = require('../helpers/validationSchema')
const Product = require('../models/product.model')
const User = require('../models/user.model')
const Machine = require('../models/machines.model')
const History = require('../models/history.model')
const Group = require('../models/groups.model')
const Supplier = require('../models/supplier.model')
const Approval = require('../models/approval.model')

const moment = require('moment')


module.exports = {
    register: async (req,res) =>{
        try {
            console.log(req.body)
            req.body["organization_id"] = res.locals.payload.organization
            if(req.body.invoice_date == "" || !req.body.invoice_date){
                req.body.invoice_date = Date.now()
            }
            let isUserValid = false
            let highRoles = ['master']
            for(let i= 0; i <res.locals.payload.roles.length;i++){
                if(highRoles.includes(res.locals.payload.roles[i].name) || res.locals.payload.roles[i].name === "admin"){
                    isUserValid = true
                }
            }
            let validTypes = ['machine','group']
            for(let dat in req.body.items){
                if(!isUserValid){
                    if(!validTypes.includes(req.body.items[dat].onModel)){
                        res.status(500).send({message:"User Do Not Have Permission"})
                    }
                    else {
                        let data = {
                            type:req.body.items[dat].onModel,
                            isApproved: false,
                            stock_count:req.body.items[dat].quantity,
                            note:req.body.items[dat].note,
                            retail_price:req.body.items[dat].total,
                            total_price:req.body.items[dat].total,
                        }
                        console.log(data)
                        req.body.items[dat].onModel === 'group'?data['group'] = req.body.items[dat].item.value:data['machine'] = req.body.items[dat].item.value
                        data["organization_id"] = res.locals.payload.organization
                        const isValidated = await approvalSchema.validateAsync(data)
                        const ApprovalReq = new Approval(isValidated)
                        const newApproval = await ApprovalReq.save()
                    }
                }
                if(!req.body.items[dat].item || !req.body.items[dat].item.value || req.body.items[dat].item.value === "" || !req.body.items[dat].total || req.body.items[dat].total === 0 || req.body.items[dat].total === ""){
                    return res.status(500).json({message:"Item Not Found"})
                }
            }
            if(!isUserValid){
                return res.status(201).json({message:"Sales Created"})
            }
            if(req.body.items){
                for(let sale in req.body.items){
                    if(req.body.items[sale].onModel === 'product'){
                        let total = 0
                        let stock = 0
                        let product = await Product.findById(req.body.items[sale].item.value,{past_history:0,created_at:0,updated_at:0})
                        console.log(product)
                        let warehouseFound = product.warehouses.findIndex(i=>i.warehouse.toString() == req.body.items[sale].warehouse.value.toString())
                        if(warehouseFound>=0){
                            console.log(product.warehouses[warehouseFound])
                            if(product.warehouses[warehouseFound].stock_count >= req.body.items[sale].quantity){
                                product.warehouses[warehouseFound].stock_count -= parseInt(req.body.items[sale].quantity)
                                product.warehouses[warehouseFound].total_amount -= parseInt(req.body.items[sale].total)
                                if(product.warehouses[warehouseFound].total_amount<0){
                                    product.warehouses[warehouseFound].total_amount = 0
                                }
                            }
                            else {
                                return res.status(500).json({message:"Stock Count Higher than available"})
                            }
                            for(let item in product.warehouses){
                                console.log(product.warehouses[item])
                                total += parseInt(product.warehouses[item].total_amount)
                                stock += parseInt(product.warehouses[item].stock_count)
                            }
                            product["total_stock"] = stock
                            product["total_amount"] = total
                            let editProduct = await Product.updateOne( { _id: req.body.items[sale].item.value,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": product } )

                            let dat = {
                                organization_id:res.locals.payload.organization,
                                group:req.body.items[sale].group?req.body.items[sale].group.value:null,
                                warehouse: req.body.items[sale].warehouse?req.body.items[sale].warehouse.value:null,
                                stock_count:req.body.items[sale].quantity,
                                retail_price:req.body.items[sale].retail_price,
                                total_amount:req.body.items[sale].total,
                                note:req.body.items[sale].note,
                                product_id:product._id,
                                category:product.category,
                                added_on:Date.now(),
                                type:"Sales Details"
                            }
                            console.log(dat)
                            const history = new History(dat)
                            const newHistory = await history.save()
                        }else {
                            return res.status(500).json({message:"Item Not Found in Warehouse"})
                        }
                    }
                    else if(req.body.items[sale].onModel === 'staffs'){
                        let staffs = await User.findById(req.body.items[sale].item.value,{password:0,created_at:0,updated_at:0})
                        if(!staffs['total_spent']){
                            staffs['total_spent'] = 0
                        }
                        staffs['total_spent'] += parseInt(req.body.items[sale].total)
                        if(!staffs['salary_history']) staffs['salary_history'] = []
                        staffs['salary_history'].push({
                            added_by:res.locals.payload.id,
                            amount_given:req.body.items[sale].total,
                            reason:req.body.items[sale].note,
                            chequeNo:req.body.items[sale].chequeNo,
                            paymentType:req.body.items[sale].paymentType,
                            added_on:Date.now()
                        })
                        if(req.body.items[sale].type==='salary'){
                            let date = null
                            if(!staffs.salary_start_date){
                                date = Date.now()
                            }
                            else {
                                date = staffs.salary_start_date
                            }
                            let startDate = moment(staffs.salary_start_date)
                            let mainStartDate = startDate.add(parseInt(req.body.items[sale].quantity), 'M').format("YYYY-MM-DD")
                            staffs["salary_start_date"] = mainStartDate
                            staffs["next_salary_date"] = moment(mainStartDate).add(1,'M').format("YYYY-MM-DD")
                        }
                        let editStaff = await User.updateOne( { _id: staffs._id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": staffs } )
                    }
                    else if(req.body.items[sale].onModel === 'machine'){
                        let machine = await Machine.findById(req.body.items[sale].item.value)
                        if(!machine['salesHistory']) machine['salesHistory'] = []
                        machine['salesHistory'].push({
                            added_by:res.locals.payload.id,
                            amount_given:req.body.items[sale].total,
                            note:req.body.items[sale].note,
                            chequeNo:req.body.items[sale].chequeNo,
                            paymentType:req.body.items[sale].paymentType,
                            added_on:Date.now()
                        })
                        machine['amount_spent'] += parseInt(req.body.items[sale].total)
                        let editMachine = await Machine.updateOne( { _id: machine._id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": machine } )
                    }
                    else if(req.body.items[sale].onModel === 'group'){
                        let group = await Group.findById(req.body.items[sale].item.value)
                        group['total_spent'] += parseInt(req.body.items[sale].total)
                        let pushData = {
                            amount:req.body.items[sale].total,
                            note:req.body.items[sale].note,
                            chequeNo:req.body.items[sale].chequeNo,
                            paymentType:req.body.items[sale].paymentType,
                            added_by:res.locals.payload.id,
                            added_on:Date.now()
                        }
                        group['paid_history'].push(pushData)
                        group['total_spent'] += parseInt(req.body.items[sale].total)
                        let editgroup = await Group.updateOne( { _id: group._id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": group } )
                    }
                    else if(req.body.items[sale].onModel === 'supplier'){
                        let supplier = await Supplier.findById(req.body.items[sale].item.value)
                        supplier['total_spent'] += parseInt(req.body.items[sale].total)
                        let pushData = {
                            amount:req.body.items[sale].total,
                            note:req.body.items[sale].note,
                            chequeNo:req.body.items[sale].chequeNo,
                            paymentType:req.body.items[sale].paymentType,
                            added_by:res.locals.payload.id
                        }
                        supplier['paid_history'].push(pushData)
                        let editgroup = await Supplier.updateOne( { _id: supplier._id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": supplier } )
                    }
                }
            }
            console.log(req.body)
            const isValidated = await salesSchema.validateAsync(req.body)
            console.log(isValidated)
            const sale = new Sales(isValidated)
            const newSales = await sale.save()
            return res.status(201).json(newSales)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_sales: async (req,res) => {
        try{
            let totalItem = await Sales.countDocuments({organization_id:{$eq:res.locals.payload.organization},deleted_at:null})
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
            let sales = await Sales.find({organization_id:{$eq:res.locals.payload.organization},deleted_at:null}).sort("-created_at").populate('client').skip(skip).limit(perPage)
            return res.status(201).json({
                data:sales,
                currentPage:parseInt(req.params.page)+1,
                totalPage:parseInt(page)
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_sales_by_id: async (req,res) => {
        try{
            let totalItem = await Sales.countDocuments({organization_id:{$eq:res.locals.payload.organization},deleted_at:null})
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
            let products = await Sales.find({organization_id:{$eq:res.locals.payload.organization},deleted_at:null}).sort({invoice_date:-1}).skip(skip).limit(perPage)
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
    search_sales: async (req,res) => {
        try {
            let query = req.params.query.toString()
            let sales = await Sales.find({ organization_id:{$eq:res.locals.payload.organization},deleted_at:null, "invoice_no": { "$regex": query, "$options": "i" } }).limit(12)
            return res.status(201).json({
                data:sales,
                currentPage:1,
                totalPage:1
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    edit_sales: async (req,res) => {
        try {
            req.body["organization_id"] = res.locals.payload.organization
            let totalAmt = 0
            for(let item in req.body.items){
                totalAmt += req.body.items[item].total
            }
            req.body["isPaid"] = req.body.amount_paid >= totalAmt;
            let editSales = await Sales.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": req.body } )
            return res.status(201).json(editSales)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    delete_sales: async (req,res) => {
        try {
            let deleteSales = await Sales.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": { "deleted_at": Date.now() } } )
            return res.status(201).json(deleteSales)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }

    }
}