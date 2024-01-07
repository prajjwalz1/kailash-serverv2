const mongoose = require("mongoose")
const Schema = mongoose.Schema

const SiteSchema = new Schema({
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
    total_amount:{
        type:Number
    },
    total_stock:{
        type:Number
    },
    image:{
        type:String,
    },
    starting_date:{
        type:Date
    },
    estimated_completion_date:{
        type:Date
    },
    allocated_budget:{
        type:Number
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

const Site = mongoose.model('site', SiteSchema)

module.exports = Site