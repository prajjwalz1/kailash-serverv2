const mongoose = require("mongoose")
const Schema = mongoose.Schema

const paidHistory = new Schema({
    amount:{
        type:Number,
        required:true
    },
    added_on:{
        type:Date,
        default:Date.now()
    },
    note:{
        type:String,
    },
    chequeNo:{
        type:String
    },
    paymentType:{
        type:String
    },
    added_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
})

const SupplierSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    paid_history:[paidHistory],
    phone:{
        type: String
    },
    total_spent:{
        type:Number,
        default:0
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    street:{
        type:String
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

const Supplier = mongoose.model('supplier', SupplierSchema)

module.exports = Supplier