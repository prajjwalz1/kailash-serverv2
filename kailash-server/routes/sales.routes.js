const express = require('express')
const router = express.Router()
const SalesController = require('../controllers/sales.controller')
const { verifyAccessToken,isAdmin, isUser } = require('../helpers/jwtHelper')

router.post('/sales',[verifyAccessToken, isUser], SalesController.register)
router.get('/sales/:page',[verifyAccessToken, isUser], SalesController.get_sales)
router.get('/sales/get/:id',[verifyAccessToken, isUser], SalesController.get_sales_by_id)
router.delete('/sales/delete/:id',[verifyAccessToken, isAdmin], SalesController.delete_sales)
router.put('/sales/edit/:id',[verifyAccessToken, isAdmin], SalesController.edit_sales)
router.get('/sales/search/:query',[verifyAccessToken, isUser], SalesController.search_sales)

module.exports = router