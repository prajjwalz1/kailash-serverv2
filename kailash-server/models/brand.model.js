const mongoose = require("mongoose")
const Schema = mongoose.Schema

const BrandSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
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

const Brand = mongoose.model('brand', BrandSchema)

module.exports = Brand