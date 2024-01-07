const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ReceiptSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    supplier:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"supplier",
    },
    image:{
        type:String
    },
    receipt_date:{
        type:Date,
        required:true
    },
    total_amount:{
        type:Number,
        default:0
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

const Receipt = mongoose.model('receipt', ReceiptSchema)

module.exports = Receipt