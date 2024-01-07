const mongoose = require("mongoose")
const Schema = mongoose.Schema

const warehouseData = new Schema({
    warehouse:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"warehouse"
    },
    supplier:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"supplier"
    }],
    total_amount:{
        type: Number,
        required: true
    },
    stock_count:{
        type:Number,
        required: true
    },
    retail_price:{
        type:Number,
    },
    reorder_point:{
        type:Number
    },
})

const groupsData = new Schema({
    group:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"groups"
    },
    supplier:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"supplier"
    }],
    total_amount:{
        type: Number,
        required: true
    },
    stock_count:{
        type:Number,
        required: true
    },
    retail_price:{
        type:Number,
    },
})

const siteData = new Schema({
    site:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"site"
    },
    supplier:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"supplier"
    }],
    total_amount:{
        type: Number,
        required: true
    },
    stock_count:{
        type:Number,
        required: true
    },
    retail_price:{
        type:Number,
    },
})

const historySchema = new Schema({
    warehouse:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"warehouse"
    },
    supplier:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"supplier"
    },
    total_amount:{
        type: Number,
        required: true
    },
    added_on:{
        type:Date,
        default:Date.now()
    },
    stock_count:{
        type:Number,
        required: true
    },
    retail_price:{
        type:Number,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category"
    },
    type:{
        type:String
    }
})

const ProductSchema = new Schema({
    warehouses:[warehouseData],
    groups:[groupsData],
    sites:[siteData],
    purchaseCount:{
        type:Number,
        default:0
    },
    purchaseAmount:{
        type:Number,
        default:0
    },
    past_history:[
        historySchema
    ],
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category"
    },
    brand:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"brand"
    },
    organization_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"organization",
        required:true
    },
    total_stock:{
        type:Number,
        required:true
    },
    total_amount:{
        type:Number,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    tax:{
        type:Number,
        default:0
    },
    created_at:{
        type:Date,
        default:Date.now()
    },
    updated_at:{
        type:Date,
        default:Date.now()
    },
    deleted_at:{
        type:Date,
        default:null
    },
})

const Product = mongoose.model('product',ProductSchema)

module.exports = Product