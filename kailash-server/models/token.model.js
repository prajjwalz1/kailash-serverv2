const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserToken = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        index: {
            expires: '7d'
        }

    }
})

const User = mongoose.model('user_token', UserToken)

module.exports = User