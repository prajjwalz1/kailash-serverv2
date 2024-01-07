const mongoose = require("mongoose")
const Schema = mongoose.Schema

const RoleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
})

RoleSchema.pre('save', function (next) {
    var self = this;
    Role.find({name : self.name}, function (err, docs) {
        if (!docs.length){
            next();
        }else{                
            console.log('user exists: ',self.name);
        }
    });
}) ;

const Role = mongoose.model('role', RoleSchema)

module.exports = Role