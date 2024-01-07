const express = require('express')
const router = express.Router()
const ReceiptController = require('../controllers/receipts.controller')
const { verifyAccessToken,isUser } = require('../helpers/jwtHelper')

router.post('/receipt',[verifyAccessToken, isUser], ReceiptController.register)
router.get('/receipt/get/:page',[verifyAccessToken, isUser], ReceiptController.get_receipt)
router.get('/receipt/get/id/:id',[verifyAccessToken, isUser], ReceiptController.get_receipt_by_id)
router.put('/receipt/delete/:id',[verifyAccessToken, isUser], ReceiptController.delete_receipt)
router.get('/receipt/search/:query',[verifyAccessToken, isUser], ReceiptController.search_receipt)
router.put('/receipt/edit/:id',[verifyAccessToken, isUser], ReceiptController.edit_receipt)

module.exports = router