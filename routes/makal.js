const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const {getMakals , getMakalByCategory , createMakal, deleteMakal } = require("../Controllers/makalController")

const router = express.Router()

router.get('/', getMakals)
router.get('/:category', getMakalByCategory)
router.post('/', createMakal)
router.post('/:id', deleteMakal)


module.exports = router