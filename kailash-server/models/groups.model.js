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

const GroupsSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    location:{
        type:String
    },
    paid_history:[paidHistory],
    warehouse:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"warehouses",
        required:true
    },
    site:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"site",
        required:true
    },
    total_spent:{
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

const Group = mongoose.model('groups', GroupsSchema)

module.exports = Group