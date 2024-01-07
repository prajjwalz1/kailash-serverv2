const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrganizationSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required: true
    }
})

const Organization = mongoose.model('organization',OrganizationSchema)

module.exports = Organization