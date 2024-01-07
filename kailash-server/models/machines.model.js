const mongoose = require("mongoose")
const Schema = mongoose.Schema

const saleHistory = new Schema({
    added_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    amount_given:{
        type:Number,
        required:true
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
    added_on:{
        type:Date,
        required:true
    }
})

const MachineSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    vehicleNo:{
        type:String
    },
    amount_spent:{
        type:Number,
        default:0
    },
    salesHistory:[saleHistory],
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

const Machine = mongoose.model('machine', MachineSchema)

module.exports = Machine