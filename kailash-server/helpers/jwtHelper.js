const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const { create } = require('../models/user.model')
const UserToken = require('../models/token.model')
const User = require('../models/user.model')
const Role = require('../models/role.model')

module.exports = {
    isMaster:(req, res, next) =>{
        let isValidated = false
        for(let i= 0; i <res.locals.payload.roles.length;i++){
            if(res.locals.payload.roles[i].name === "master"){
                isValidated = true
                next()
                return;
            }
        }
        if(!isValidated){
            res.status(500).send({message:"User Do Not Have Permission"})
        }
    },
    isAdmin:(req, res, next) =>{
        let isValidated = false
        let higherRoles = ['master']
        for(let i= 0; i <res.locals.payload.roles.length;i++){
            if(higherRoles.includes(res.locals.payload.roles[i].name) || res.locals.payload.roles[i].name === "admin"){
                isValidated = true
                next()
                return;
            }
        }
        if(!isValidated){
            res.status(500).send({message:"User Do Not Have Permission"})
        }
    },
    isUser:(req, res, next) =>{
        let isValidated = false
        let higherRoles = ['master','admin']
        for(let i= 0; i <res.locals.payload.roles.length;i++){
            if(higherRoles.includes(res.locals.payload.roles[i].name) || res.locals.payload.roles[i].name === "user"){
                isValidated = true
                next()
                return;
            }
        }
        if(!isValidated){
            res.status(500).send({message:"User Do Not Have Permission"})
        }
    },
    signAccessToken: (userId) => {
        return new Promise(async (resolve, reject) => {
            const user = await User.findById(userId).populate('roles')
            const payload = {
                id:userId,
                roles:user.roles,
                organization:user.organization_id,
                name:user.full_name
            }
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                expiresIn: "1h",
                issuer: "emedisolution.com",
                audience: userId
            }
            jwt.sign(payload, secret, options, (err, token) => {
                if (err) {
                    reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    verifyToken:  (req,res,next) =>{
        let token = req.headers["authorization"]
        if(!token){
            return res.status(403).send({message: "No token provided!"});
        }
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, payload) => {
            if (err) return reject(createError.Unauthorized())
            const userId = payload.id
            let checkToken = await UserToken.findOne({ userId: userId })
            if (!checkToken) throw createError.Conflict(`Invalid Token`)
            if(checkToken.token !== token){
                return res.status(403).send({message: "Token Does Not Match!"});
            }
            res.locals.payload = payload
            next();

        })
    },
    verifyAccessToken: (req, res, next) => {
        const token = req.headers["authorization"]
        if(!token){
            return res.status(403).send({message: "No token provided!"});
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
            if (err) res.status(500).send({message:"User Do Not Have Permission"})
            res.locals.payload = payload
            next();
        })
    },
    getTokenData: (token) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
                if (err) {
                    const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
                    return next(createError.Unauthorized(message))
                }
                resolve(payload)
            })
        })
        
    },
    signRefreshToken: (userId) => {
        return new Promise( async (resolve, reject) => {
            const user = await User.findById(userId).populate('roles')
            const payload = {
                id:userId,
                roles:user.roles,
                organization:user.organization_id,
                name:user.full_name
            }
            const secret = process.env.REFRESH_TOKEN_SECRET
            const options = {
                expiresIn: "1d",
                issuer: "emedisolution.com",
                audience: userId
            }
            jwt.sign(payload, secret, options, (err, token) => {
                if (err) {
                    reject(createError.InternalServerError())
                }
                UserToken.findOneAndUpdate({ userId: userId }, { token: token }, { new: true, upsert: true }, (err, doc) => {
                    if (err) {
                        reject(createError.InternalServerError())
                        return
                    }
                    resolve(token)
                })
            })
        })
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if (err) return reject(createError.Unauthorized())
                const userId = payload.id
                UserToken.findOne({ userId: userId }, (err, doc) => {
                    if (err) return reject(createError.InternalServerError())
                    if (doc.token !== refreshToken) {
                        reject(createError.InternalServerError())
                        return
                    }
                    return resolve(userId)
                })
            })
        })
    },
    resetPasswordToken: (user) => {
        return new Promise((resolve, reject) => {
            const secret = process.env.RESET_PASSWORD_SECRET + user.password
            const payload = {
                email: user.email,
                id: user.id
            }
            const options = {
                expiresIn: "15m",
            }
            jwt.sign(payload, secret, options, (err, token) => {
                if (err) {
                    reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    verifyResetPasswordToken: (token, salt) => {
        return new Promise((resolve, reject) => {
            const secret = process.env.RESET_PASSWORD_SECRET + salt
            jwt.verify(token, secret, (err, payload) => {
                if (err) return reject(createError.Unauthorized())
                resolve(payload)
            })
        })
    }
}