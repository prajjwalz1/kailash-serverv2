const express = require('express')
const router = express.Router()
const UserController = require('../controllers/user.controller')
const {verifyAccessToken,isAdmin,isMaster,isUser } = require('../helpers/jwtHelper')

router.post('/user',[verifyAccessToken, isAdmin], UserController.register)
router.get('/user/get',[verifyAccessToken, isUser], UserController.get_users)
router.get('/user/search/:query',[verifyAccessToken, isUser], UserController.search_users)
router.get('/user/id/:id',[verifyAccessToken, isUser], UserController.get_users_by_id)
router.put('/user/delete/:id',[verifyAccessToken, isMaster], UserController.delete_user)
router.put('/user/edit/:id',[verifyAccessToken, isMaster], UserController.edit_user)

module.exports = router