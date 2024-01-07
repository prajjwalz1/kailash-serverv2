const express = require('express')
const router = express.Router()
const WarehouseController = require('../controllers/warehouse.controller')
const { verifyAccessToken,isAdmin,isUser } = require('../helpers/jwtHelper')

router.post('/warehouse',[verifyAccessToken, isAdmin], WarehouseController.register)
router.get('/warehouse/get/:page',[verifyAccessToken, isUser], WarehouseController.get_Warehouse)
router.get('/warehouse/get',[verifyAccessToken, isUser], WarehouseController.get_all_Warehouse)
router.get('/warehouse/get/id/:id',[verifyAccessToken, isUser], WarehouseController.get_Warehouses_by_id)
router.put('/warehouse/delete/:id',[verifyAccessToken, isAdmin], WarehouseController.delete_Warehouse)
router.put('/warehouse/edit/:id',[verifyAccessToken, isAdmin], WarehouseController.edit_Warehouse)
router.get('/warehouse/search/:query',[verifyAccessToken, isUser], WarehouseController.search_Warehouses)
router.get('/warehouse/history/:id/page/:page',[verifyAccessToken, isUser], WarehouseController.get_warehouses_inventory_history)

module.exports = router