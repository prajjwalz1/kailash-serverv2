const createError = require('http-errors')
const Sales = require('../models/sales.model')
const User = require('../models/user.model')
const Approvals = require('../models/approval.model')
const Warehouse = require('../models/warehouse.model')
const Product = require('../models/product.model')
const History = require('../models/history.model')
const mongoose = require('mongoose')
const moment = require('moment')

module.exports = {
    get_home: async (req,res) =>{
        try {
            let totalApprovals = await Approvals.countDocuments({
                organization_id: {$eq: res.locals.payload.organization},
                deleted_at: null,
                isApproved: false
            })
            let totalWarehouse = await Warehouse.countDocuments({
                organization_id: {$eq: res.locals.payload.organization},
                deleted_at: null
            })
            let totalUsers = await User.countDocuments({
                organization_id: {$eq: res.locals.payload.organization},
                deleted_at: null
            })
            let totalProducts = await Product.countDocuments({
                organization_id: {$eq: res.locals.payload.organization},
                deleted_at: null
            })
            let currentDate = new Date();
            let unpaidSalary = await User.find({
                $and: [
                    {
                        "next_salary_date": {$lte: currentDate}
                    },
                    {organization_id: {$eq: res.locals.payload.organization}},
                    {deleted_at: {$eq: null}}
                ]
            })
            let topProd = await Product.find({
                organization_id: {$eq: res.locals.payload.organization},
                deleted_at: null
            }, '_id name category purchaseCount purchaseAmount').populate('category').sort({purchaseCount: -1}).limit(6)
            let data = {
                approvals: totalApprovals,
                warehouses: totalWarehouse,
                staffs: totalUsers,
                products: totalProducts,
                unpaidSalary: unpaidSalary,
                topProd: topProd
            }
            return res.status(201).json(data)
        }
         catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_low_inventory: async (req,res) =>{
        try{
            let totalItem = await Product.countDocuments({
                $and:[
                    { $expr: { $gt: [ "$warehouses.reorder_point" , "$warehouses.stock_count" ] } },
                    {organization_id:{$eq:res.locals.payload.organization},deleted_at:null},
                ]
            })
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
            let clients = await Product.find({
                $and:[
                    { $expr: { $gt: [ "$warehouses.reorder_point" , "$warehouses.stock_count" ] } },
                    {organization_id:{$eq:res.locals.payload.organization},deleted_at:null},
                ]
            }).populate('warehouses.warehouse category').skip(skip).limit(perPage)
            return res.status(201).json({
                data:clients,
                currentPage:parseInt(req.params.page)+1,
                totalPage:parseInt(page)
            })
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_inventory: async (req, res) =>{
        try {
            let categories = []
            let weekCategories = []
            let data = [
                {
                    name: 'Product Amount',
                    data: []
                },
                {
                    name: 'Product Stock',
                    data: []
                }
            ]
            let weekData = [
                {
                    name: 'Product Amount',
                    data: []
                },
                {
                    name: 'Product Stock',
                    data: []
                }
            ]
            let today = Date.now()
            let startTemp = moment(today).format("YYYY-MM-01")
            let stWeek = moment(today).format("YYYY-MM-DD")
            //gets chart data for appointments
            for(let i=6;i>=0;i--){
                const tempStart = moment(startTemp)
                let tempDat = tempStart.subtract(i,'month')
                let tempWeek =  moment(stWeek).subtract(i,'day')
                let startWeek = tempWeek.format("YYYY-MM-DDT01:00")
                let endWeek = tempWeek.format("YYYY-MM-DDT23:00")
                let start = tempDat.format("YYYY-MM-DD")
                let end = tempDat.endOf('month').format("YYYY-MM-DD")
                let week = await History.aggregate([
                    {
                        $match: {
                            $and:[
                                {deleted_at:{$eq:null}},
                                {type:{$ne:"Transferred Data"}},
                                {type:{$ne:"Sales Details"}},
                                {organization_id:{$eq:mongoose.Types.ObjectId(res.locals.payload.organization)}},
                                {created_at: { $gte: new Date(startWeek)}},
                                {created_at: { $lte: new Date(endWeek)}}
                            ]
                        }
                    },
                    {
                        $group: {
                            _id:'amount',
                            total_amount: {$sum: "$total_amount"},
                            total_stock: {$sum: "$stock_count"}
                        }
                    }
                ])
                let weekAmt = 0
                let weekStock = 0
                if(week.length>0 && week[0].total_amount){
                    weekAmt = week[0].total_amount
                }
                if(week.length>0 && week[0].total_stock){
                    weekStock = week[0].total_stock
                }
                let month = await History.aggregate([
                    {
                        $match: {
                            $and:[
                                {deleted_at:{$eq:null}},
                                {type:{$ne:"Transferred Data"}},
                                {type:{$ne:"Sales Details"}},
                                {organization_id:{$eq:mongoose.Types.ObjectId(res.locals.payload.organization)}},
                                {created_at: { $gte: new Date(start)}},
                                {created_at: { $lte: new Date(end)}}
                            ]
                        }
                    },
                    {
                        $group: {
                            _id:'amount',
                            total_amount: {$sum: "$total_amount"},
                            total_stock: {$sum: "$stock_count"}
                        }
                    }
                ])
                let monthAmt = 0
                let monthStock = 0
                if(month.length>0 && month[0].total_amount){
                    monthAmt = month[0].total_amount
                }
                if(month.length>0 && month[0].total_stock){
                    monthStock = month[0].total_stock
                }
                weekData[0].data.push(weekAmt)
                weekData[1].data.push(weekStock)
                data[0].data.push(monthAmt)
                data[1].data.push(monthStock)
                let dat = tempDat.format('MMM')
                let weekDat = tempWeek.format('ddd')
                categories.push(dat)
                weekCategories.push(weekDat)
            }
            let total = await Product.aggregate([
                {
                    $match: {
                        $and:[
                            {deleted_at:{$eq:null}},
                            {organization_id:{$eq:mongoose.Types.ObjectId(res.locals.payload.organization)}},
                        ]
                    }
                },
                {
                    $group: {
                        _id:'amount',
                        total_amount: {$sum: "$total_amount"},
                        total_stock: {$sum: "$total_stock"}
                    }
                }
            ])
            let topProd = await Product.find({
                organization_id: {$eq: res.locals.payload.organization},
                deleted_at: null
            }, '_id name category purchaseCount purchaseAmount').populate('category').sort({purchaseCount: -1}).limit(6)
            return res.status(201).json({
                months:{
                    categories:categories,
                    series:data
                },
                weeks:{
                    categories:weekCategories,
                    series:weekData
                },
                total:total,
                topProd:topProd
            })
        }
        catch (error) {
            if (error.isJoi === true) error.status = 422
            console.log(error)
            return res.status(500).json(error)
        }
    },
    get_sales: async (req, res) =>{
        try {
            let categories = []
            let weekCategories = []
            let data = [
                {
                    name: 'Sales',
                    data: []
                }
            ]
            let weekData = [
                {
                    name: 'Sales',
                    data: []
                }
            ]
            let today = Date.now()
            let startTemp = moment(today).format("YYYY-MM-01")
            let stWeek = moment(today).format("YYYY-MM-DD")
            //gets chart data for appointments
            for(let i=6;i>=0;i--){
                const tempStart = moment(startTemp)
                let tempDat = tempStart.subtract(i,'month')
                let tempWeek =  moment(stWeek).subtract(i,'day')
                let startWeek = tempWeek.format("YYYY-MM-DDT01:00")
                let endWeek = tempWeek.format("YYYY-MM-DDT23:00")
                let start = tempDat.format("YYYY-MM-DD")
                let end = tempDat.endOf('month').format("YYYY-MM-DD")
                let week = await Sales.aggregate([
                    {
                        $match: {
                            $and:[
                                {deleted_at:{$eq:null}},
                                {organization_id:{$eq:mongoose.Types.ObjectId(res.locals.payload.organization)}},
                                {created_at: { $gte: new Date(startWeek)}},
                                {created_at: { $lte: new Date(endWeek)}}
                            ]
                        }
                    },
                    {
                        $unwind: '$items'
                    },
                    {
                        $group: {
                            _id:'amount',
                            total_amount: {$sum: "$items.total"}
                        }
                    }
                ])
                let month = await Sales.aggregate([
                    {
                        $match: {
                            $and:[
                                {deleted_at:{$eq:null}},
                                {organization_id:{$eq:mongoose.Types.ObjectId(res.locals.payload.organization)}},
                                {created_at: { $gte: new Date(start)}},
                                {created_at: { $lte: new Date(end)}}
                            ]
                        }
                    },
                    {
                        $unwind: '$items'
                    },
                    {
                        $group: {
                            _id:'amount',
                            total_amount: {$sum: "$items.total"}
                        }
                    }
                ])
                weekData[0].data.push(week.length>0?week[0].total_amount:0)
                data[0].data.push(month.length>0?month[0].total_amount:0)
                let dat = tempDat.format('MMM')
                let weekDat = tempWeek.format('ddd')
                categories.push(dat)
                weekCategories.push(weekDat)
            }
            let topProd = await Product.find({organization_id:{$eq:res.locals.payload.organization},deleted_at:null},'_id name category purchaseCount').populate('category').sort({purchaseCount:-1}).limit(6)
            let totalSales = await Sales.aggregate([
                {
                    $match: {
                        $and:[
                            {deleted_at:{$eq:null}},
                            {organization_id:{$eq:mongoose.Types.ObjectId(res.locals.payload.organization)}},
                        ]
                    }
                },
                {
                    $unwind: '$items'
                },
                {
                    $group: {
                        _id:'amount',
                        total_amount: {$sum: "$items.total"}
                    }
                }
            ])
            let totalStock = await Sales.aggregate([
                {
                    $match: {
                        $and:[
                            {deleted_at:{$eq:null}},
                            {organization_id:{$eq:mongoose.Types.ObjectId(res.locals.payload.organization)}},
                        ]
                    }
                },
                {
                    $unwind: '$items'
                },
                {
                    $group: {
                        _id:'amount',
                        total_stock: {$sum: "$items.quantity"}
                    }
                }
            ])
            return res.status(201).json({
                months:{
                    categories:categories,
                    series:data
                },
                weeks:{
                    categories:weekCategories,
                    series:weekData
                },
                products:topProd,
                totalSales:totalSales,
                totalStock:totalStock
            })
        }
         catch (error) {
            if (error.isJoi === true) error.status = 422
            console.log(error)
            return res.status(500).json(error)
        }
    },
}