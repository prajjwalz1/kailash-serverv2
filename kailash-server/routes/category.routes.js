const express = require('express')
const router = express.Router()
const CategoryController = require('../controllers/category.controller')
const { verifyAccessToken,isUser } = require('../helpers/jwtHelper')

router.post('/category',[verifyAccessToken, isUser], CategoryController.register)
router.get('/category/get',[verifyAccessToken, isUser], CategoryController.get_category)
router.put('/category/delete/:id',[verifyAccessToken, isUser], CategoryController.delete_category)

module.exports = router