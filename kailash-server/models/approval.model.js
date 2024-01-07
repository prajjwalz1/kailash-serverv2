const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ApprovalSchema = new Schema({
    warehouse_start:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"warehouse",
    },
    warehouse_end:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"warehouse"
    },
    group_start:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"groups",
    },
    group_end:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"groups"
    },
    site_start:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"site",
    },
    site_end:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"site"
    },
    supplier:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"supplier"
    },
    product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"product",
    },
    group:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"groups",
    },
    machine:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"machine",
    },
    isApproved:{
        type:Boolean,
        required:true
    },
    note:{
        type:String,
    },
    added_by:{
        type:String,
    },
    stock_count:{
        type:Number
    },
    retail_price:{
        type:Number
    },
    type:{
        type:String,
        required: true,
        enum: ['update', 'transfer','group','machine']
    },
    status:{
        type:String,
        default:"Not Received"
    },
    total_price:{
        type:Number,
        required:true
    },
    organization_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"organization",
        required:true
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

const Approval = mongoose.model('approvals', ApprovalSchema)

module.exports = Approval