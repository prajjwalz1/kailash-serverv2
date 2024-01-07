const createError = require('http-errors')
const Approval = require('../models/approval.model')
const Product = require('../models/product.model')
const History = require('../models/history.model')
const Group = require('../models/groups.model')
const Machine = require('../models/machines.model')
const Sales = require('../models/sales.model')
const  {approvalSchema, salesSchema} = require('../helpers/validationSchema')

module.exports = {
    register: async (req,res) =>{
        try {
            req.body["organization_id"] = res.locals.payload.organization
            req.body['added_by'] = res.locals.payload.name
            console.log(req.body)
            for(let key in req.body){
                if(req.body[key] === ''){
                    delete req.body[key]
                }
            }
            const isValidated = await approvalSchema.validateAsync(req.body)
            const ApprovalReq = new Approval(isValidated)
            const newApproval = await ApprovalReq.save()
            return res.status(201).json(newApproval)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    delete_approval: async (req,res) => {
        try {
            let deleteApproval = await Approval.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": { "deleted_at": Date.now() } } )
            return res.status(201).json(deleteApproval)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    change_status:async (req,res)=>{
        try {
            let statusOptions = ['Received','Not Received']
            if(statusOptions.includes(req.params.status)){
                let editApproval = await Approval.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": {status:req.params.status} } )
                return res.status(201).json({message:"Saved"})
            }
            else {
                return res.status(400).json({message:"Wrong Status Option"})
            }
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_Approval: async (req,res) => {
        try {
            let approvals = await Approval.find({ organization_id: res.locals.payload.organization, deleted_at:null, isApproved:false }).populate('product_id machine group warehouse_start warehouse_end group_start group_end site_start site_end supplier',{name:1,_id:1})
            return res.status(201).json(approvals)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    approve_Approval: async (req,res) => {
        try {
            let approval = await Approval.findById(req.params.id).populate('group machine')
            let salesType = ['group','machine']
            let item = {}
            if(salesType.includes(approval.type)){
                if(approval.type === 'machine'){
                    item = {label:approval.machine.name,value:approval.machine._id}
                    let machine = approval.machine
                    if(!machine['salesHistory']) machine['salesHistory'] = []
                    machine['salesHistory'].push({
                        added_by:res.locals.payload.id,
                        amount_given:approval.total_price,
                        added_on:Date.now()
                    })
                    machine['amount_spent'] += parseInt(approval.total_price)
                    let editMachine = await Machine.updateOne( { _id: machine._id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": machine } )
                }
                else if(approval.type === 'group'){
                    item = {label:approval.group.name,value:approval.group._id}
                    let group = approval.group
                    group['total_spent'] += parseInt(req.body.total_price)
                    let pushData = {
                        amount:approval.total_price,
                        added_by:res.locals.payload.id,
                        added_on:Date.now()
                    }
                    group['paid_history'].push(pushData)
                    group['total_spent'] += parseInt(approval.total_price)
                    let editgroup = await Group.updateOne( { _id: group._id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": group } )
                }
                let items = [{
                    item:item,
                    quantity:1,
                    retail_price:approval.total_price,
                    total:approval.total_price,
                    onModel:approval.type
                }]
                let salesData = {
                    items: items,
                    total_amount: approval.total_price,
                    organization_id: res.locals.payload.organization,
                    invoice_date: Date.now(),
                }
                const isValidated = await salesSchema.validateAsync(salesData)
                const sale = new Sales(isValidated)
                const newSales = await sale.save()
                let editApproval = await Approval.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": {isApproved:true} } )
                return res.status(201).json(editApproval)
            }
            else {
                let total = 0
                let stock = 0
                let product = await Product.findById(approval.product_id,{past_history:0,created_at:0,updated_at:0})
                let start = ""
                let startSub = ""
                let end = ""
                let endSub = ""
                if(approval.warehouse_start && approval.warehouse_start !== ''){
                    start = "warehouses"
                    startSub = "warehouse"
                }
                else if(approval.site_start && approval.site_start !== ''){
                    start = "sites"
                    startSub = "site"
                }
                else if(approval.group_start && approval.group_start !== ''){
                    start = "groups"
                    startSub = "group"
                }
                if(approval.warehouse_end && approval.warehouse_end !== ''){
                    end = "warehouses"
                    endSub = "warehouse"
                }
                else if(approval.site_end && approval.site_end !== ''){
                    end = "sites"
                    endSub = "site"
                }
                else if(approval.group_end && approval.group_end !== ''){
                    end = "groups"
                    endSub = "group"
                }
                if(approval.type === 'update' && product){
                    console.log(start)
                    console.log(startSub)
                    console.log(approval[startSub+'start'])
                    let warehouseFound = product[start].findIndex(i=>i[startSub].toString() == approval[startSub+'_start'].toString())
                    if(warehouseFound>=0){
                        product[start][warehouseFound].stock_count += parseInt(approval.stock_count)
                        product[start][warehouseFound].total_amount += parseInt(approval.total_price)
                        if(Array.isArray(product[start][warehouseFound].supplier) && !product[start][warehouseFound].supplier.includes(approval.supplier)){
                            product[start][warehouseFound].supplier.push(approval.supplier)
                        }
                    }
                    else {
                        let ware = {
                            [startSub]:approval[startSub+'start'],
                            total_amount:approval.total_price,
                            stock_count:approval.stock_count,
                            retail_price:approval.retail_price,
                            supplier:[approval.supplier],
                        }
                        product.warehouses.push(ware)
                    }
                    let editProduct = await Product.updateOne( { _id: approval.product_id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": product } )
                    let dat = {
                        organization_id:res.locals.payload.organization,
                        supplier: approval.supplier,
                        [startSub]: approval[startSub+'_start'],
                        stock_count:approval.stock_count,
                        retail_price:approval.retail_price,
                        total_amount:approval.total_price,
                        category:product.category,
                        added_on:Date.now(),
                        product_id:product._id,
                        added_by:res.locals.payload.name,
                        type:"Data Added To Existing"
                    }
                    console.log(dat)
                    const history = new History(dat)
                    const newHistory = await history.save()
                }
                else if(approval.type === 'transfer' && product){
                    let findStart = product[start].findIndex(f=>f[startSub].toString() == approval[startSub+'_start'].toString())
                    if(findStart<0){
                        return res.status(500).json({message: "Starting "+startSub+" has no product"})
                    }
                    else {
                        if(approval.stock_count>product[start][findStart].stock_count && approval.total_price>product[start][findStart].total_amount){
                            return res.status(500).json({message: "Stock amount more than "+startSub+" stock's amount"})
                        }
                        else {
                            product[start][findStart].stock_count -= parseInt(approval.stock_count)
                            product[start][findStart].total_amount -= parseInt(approval.total_price)
                        }
                    }
                    let findEnd = product[end].findIndex(j=>j[endSub].toString() == approval[endSub+'_end'].toString())
                    if(findEnd<0){
                        let ware = {
                            [endSub]:approval[endSub+'_end'],
                            total_amount:approval.total_price,
                            stock_count:approval.stock_count,
                            retail_price:approval.retail_price,
                            reorder_point:10
                        }
                        product[end].push(ware)
                    }
                    else {
                        product[end][findEnd].stock_count += parseInt(approval.stock_count)
                        product[end][findEnd].total_amount += parseInt(approval.total_price)
                    }
                    let dat = {
                        organization_id:res.locals.payload.organization,
                        [startSub]: approval[startSub+'_start'],
                        [endSub+'_end']: approval[endSub+'_end'],
                        stock_count:approval.stock_count,
                        retail_price:approval.retail_price,
                        total_amount:approval.total_price,
                        category:product.category,
                        added_on:Date.now(),
                        added_by:res.locals.payload.name,
                        product_id:product._id,
                        type:"Transferred Data"
                    }
                    const history = new History(dat)
                    const newHistory = await history.save()
                }
                for(let item in product.warehouses){
                    total += parseInt(product.warehouses[item].total_amount)
                    stock += parseInt(product.warehouses[item].stock_count)
                }
                for(let item in product.groups){
                    total += parseInt(product.groups[item].total_amount)
                    stock += parseInt(product.groups[item].stock_count)
                }
                for(let item in product.sites){
                    total += parseInt(product.sites[item].total_amount)
                    stock += parseInt(product.sites[item].stock_count)
                }
                product["total_stock"] = stock
                product["total_amount"] = total
                let editApproval = await Approval.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": {isApproved:true} } )
                let editProduct = await Product.updateOne( { _id: approval.product_id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": product } )
                return res.status(201).json(editApproval)
            }

        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    }
}