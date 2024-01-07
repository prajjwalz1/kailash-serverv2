const express = require('express')
const router = express.Router()
const GroupController = require('../controllers/groups.controller')
const { verifyAccessToken,isUser,isAdmin } = require('../helpers/jwtHelper')

router.post('/group',[verifyAccessToken, isUser], GroupController.register)
router.get('/group/search/:query',[verifyAccessToken, isUser], GroupController.search_groups)
router.get('/group/:page',[verifyAccessToken, isUser], GroupController.get_groups)
router.put('/group/delete/:id',[verifyAccessToken, isUser], GroupController.delete_group)
router.put('/group/edit/:id',[verifyAccessToken, isUser], GroupController.edit_group)
router.get('/group/get/:id',[verifyAccessToken, isUser], GroupController.get_groups_by_id)
router.get('/group/history/:id/page/:page',[verifyAccessToken, isUser], GroupController.get_groups_inventory_history)


module.exports = router