const express = require('express')
const router = express.Router()
const OrgController = require('../controllers/organization.controller')
const { verifyAccessToken,isMaster } = require('../helpers/jwtHelper')

router.post('/org',[verifyAccessToken, isMaster], OrgController.register)

module.exports = router