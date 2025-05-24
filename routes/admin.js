const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { adminLogin } = require("../Controllers/adminController")

const router = express.Router()

//router.use(requireAuth)

router.post('/', adminLogin)

module.exports = router