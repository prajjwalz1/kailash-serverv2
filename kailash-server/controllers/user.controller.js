const createError = require('http-errors')
const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const Role = require('../models/role.model')
const {userSchema} = require('../helpers/validationSchema')

module.exports = {
    register: async (req,res) =>{
        try {
            req.body["organization_id"] = res.locals.payload.organization
            if(!req.body.isAdmin){
                req.body.isAdmin = false
                req.body['roles'] = ['user']
            }
            else {
                req.body.isAdmin = true
                req.body['roles'] = ['user','admin']
            }
            const doesExists = await User.findOne({ email: req.body.email })
            if (doesExists) throw createError.Conflict(`${req.body.email} already registered`)
            req.body["roles"] = req.body["roles"].filter(i=>i !=="master")
            const roles = await Role.find({name:{$in: req.body.roles}},(err, roles)=>{
                if(err){
                    res.status(500).send({ message: err });
                    return;
                }
            })
            if (!roles) throw createError.Conflict(`Roles does not exist.`)
            req.body.roles = roles.map(role => role._id);
            const isValidated = await userSchema.validateAsync(req.body)
            const user = new User(isValidated)
            const newUser = await user.save()
            return res.status(201).json(newUser)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    edit_user: async (req,res) => {
        try {
            req.body["organization_id"] = res.locals.payload.organization
            delete req.body["salary_history"]
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(req.body.password, salt)
            req.body.password = hashedPassword
            let editUser = await User.updateOne({"_id":req.params.id,organization_id:res.locals.payload.organization,deleted_at:null},{"$set":req.body})
            return res.status(201).json(req.body)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_users: async (req,res) => {
        try{
            let users = await User.find( {
                organization_id: {$eq: res.locals.payload.organization},
                deleted_at: null
            },{password:0}).populate('warehouse salary_history.added_by')
            return res.status(201).json(users)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    search_users: async (req,res) => {
        try {
            let query = req.params.query.toString()
            let users = await User.find({ organization_id:{$eq:res.locals.payload.organization},deleted_at:null, "full_name": { "$regex": query, "$options": "i" } },{password:0}).populate('warehouse').limit(12)
            return res.status(201).json(users)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    delete_user: async (req,res) => {
        try {
            let deleteUser = await User.updateOne( { _id: req.params.id,organization_id:res.locals.payload.organization,deleted_at:null },{ "$set": { "deleted_at": Date.now() } } )
            return res.status(201).json(deleteUser)
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    },
    get_users_by_id: async (req,res) => {
        try {
            let query = req.params.id.toString()
            let client = await User.findById(query,{password:0})
            if(client.organization_id == res.locals.payload.organization && client.deleted_at === null){
                return res.status(201).json(client)
            }
            else {
                return res.status(400).json({message: "You do not have the permissions to access the info"})
            }

        } catch (error) {
            if (error.isJoi === true) error.status = 422
            return res.status(400).json({message: error.message})
        }
    }
}