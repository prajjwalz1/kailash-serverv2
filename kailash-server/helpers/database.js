const mongoose = require('mongoose')
const createError = require('http-errors')
const Organization = require('../models/organization.model')
const User = require('../models/user.model')
const Role = require('../models/role.model')
const { userSchema } = require('../helpers/validationSchema')
console.log(process.env.MONGODB_URI)
console.log(process.env.dbName)
mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.dbName,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
    .then(() => {
        console.log('mongodb connected')
    })
    .catch(err => console.log(err.message))

mongoose.connection.on('connected', () => {
    console.log("Mongoose connected to db")
    initial()
    initOrg()
})

mongoose.connection.on('error', (err) => {
    console.log(err.message)
})

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose connection is disconnected...')
})

process.on('SIGINT', async () => {
    await mongoose.connection.close()
    process.exit(0)
})

async function initOrg(){
    if(process.env.organization){
        const doesExists = await Organization.findOne({ username: process.env.organization })
        if(!doesExists){
            const org = new Organization({
                username:process.env.organization,
                name:process.env.organization
            })
            let savedOrg = await org.save()
            initUser(savedOrg._id)

        }
    }
    else{
        const doesExists = await Organization.findOne({ username: 'sculptbf' })
        if(!doesExists){
            const org = new Organization({
                username:'sculptbf',
                name:'sculptbf'
            })
            let savedOrg = await org.save()
            initUser(savedOrg._id)
        }
    }
}

async function initUser(id){
    if(process.env.email && process.env.password){
        let result = {
            email:process.env.email,
            password:process.env.password,
            full_name:"Admin User",
            isAdmin:true,
            gender:"male",
            dob:"1999-06-23",
            ethnicity:"Nepali",
            organization_id:id
        }
        result['roles'] = ["master","user"]
        const doesExists = await User.findOne({ email: result.email })
        if(!doesExists){
            Role.find({
                    name:{$in: result.roles}
                },
                (err, roles)=>{
                    result.roles = roles.map(role => role._id);
                    const user = new User(result)
                    user.save()
                }
            )
        }
    }

}

function initial(){
    let roles = ['master','admin','user']
    for(let role in roles){
        new Role({
            name: roles[role]
        }).save((dat,err)=>{
            console.log("Added");
        })
    }
    
}
