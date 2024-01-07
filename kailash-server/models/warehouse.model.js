const mongoose = require("mongoose")
const Schema = mongoose.Schema

const WarehouseSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        required: true
    },
    state:{
        type:String,
    },
    street:{
        type:String,
    },
    warehouse_owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    mobile_number:{
        type: String,
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

const Warehouse = mongoose.model('warehouse', WarehouseSchema)

module.exports = Warehouse