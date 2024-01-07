const express = require('express')
const router = express.Router()

const AuthController = require('../controllers/auth.controller')

router.post('/register', AuthController.register)

router.get('/login', AuthController.login_get)

router.post('/login', AuthController.login)

router.post('/verify/access-token', AuthController.verify_access_token)

router.post('/refresh-token', AuthController.refreshToken)

router.delete('/logout', AuthController.logout)

router.get('/forgot-password', AuthController.forgot_password_get)

router.post('/forgot-password', AuthController.forgot_password_post)

router.get('/reset-password/:id/:token', AuthController.reset_password_get)

router.post('/reset-password/:id/:token', AuthController.reset_password_post)

module.exports = router