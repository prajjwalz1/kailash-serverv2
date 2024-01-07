const express = require('express')
const router = express.Router()
const BrandController = require('../controllers/brand.controller')
const { verifyAccessToken, isAdmin, isUser } = require('../helpers/jwtHelper')

router.post('/brand',[verifyAccessToken, isAdmin], BrandController.register)
router.get('/brand/get',[verifyAccessToken, isUser], BrandController.get_Brand)
router.put('/brand/delete/:id',[verifyAccessToken, isUser], BrandController.delete_Brand)

module.exports = router