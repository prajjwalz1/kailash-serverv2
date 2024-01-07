const mongoose = require("mongoose")
const Schema = mongoose.Schema

const historySchema = new Schema({
    organization_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"organization",
        required:true
    },
    warehouse:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"warehouse"
    },
    warehouse_end:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"warehouse"
    },
    supplier:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"supplier"
    },
    group:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"groups"
    },
    site:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"site"
    },
    total_amount:{
        type: Number,
        required: true
    },
    note:{
        type:String,
    },
    product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"product"
    },
    added_on:{
        type:Date,
        default:Date.now()
    },
    added_by:{
        type:String
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

const History = mongoose.model('history', historySchema)



module.exports = History