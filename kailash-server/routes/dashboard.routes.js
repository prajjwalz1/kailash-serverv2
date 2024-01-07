const express = require('express')
const router = express.Router()
const { verifyToken, isMaster,verifyAccessToken,isUser } = require('../helpers/jwtHelper')

const DashboardController = require('../controllers/dashboard.controller')
router.get('/dashboard', [verifyAccessToken,isUser], DashboardController.get_home)
router.get('/dashboard/sales', [verifyAccessToken,isUser], DashboardController.get_sales)
router.get('/dashboard/inventory', [verifyAccessToken,isUser], DashboardController.get_inventory)
router.get('/dashboard/inventory/low/:page', [verifyAccessToken,isUser], DashboardController.get_low_inventory)



module.exports = router