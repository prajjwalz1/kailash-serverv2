const express = require('express')
const router = express.Router()
const SiteController = require('../controllers/site.controller.js')
const { verifyAccessToken,isAdmin,isUser } = require('../helpers/jwtHelper')

router.post('/site',[verifyAccessToken, isAdmin], SiteController.register)
router.get('/site/get/:page',[verifyAccessToken, isUser], SiteController.get_Site)
router.get('/site/get',[verifyAccessToken, isUser], SiteController.get_all_Site)
router.get('/site/get/id/:id',[verifyAccessToken, isUser], SiteController.get_Sites_by_id)
router.put('/site/delete/:id',[verifyAccessToken, isAdmin], SiteController.delete_Site)
router.put('/site/edit/:id',[verifyAccessToken, isAdmin], SiteController.edit_Site)
router.get('/site/search/:query',[verifyAccessToken, isUser], SiteController.search_Sites)
router.get('/site/history/:id/page/:page',[verifyAccessToken, isUser], SiteController.get_sites_inventory_history)

module.exports = router