const mongoose = require("mongoose")
const Schema = mongoose.Schema

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    type:{
        type: String,
        required:true,
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

const Category = mongoose.model('category', CategorySchema)

module.exports = Category