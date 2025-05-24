const express = require('express')
const Cons = require('../models/consModel')
const requireAuth = require('../middleware/requireAuth')
const {getCons , getOneCon , createCons, deleteCon, updateCon, approveMember} = require("../Controllers/consController")

const router = express.Router()

//router.use(requireAuth)

router.get('/', getCons)

router.get('/:id', getOneCon)

router.post('/', createCons)

router.delete('/:id', deleteCon)

router.patch('/:id', updateCon)

module.exports = router