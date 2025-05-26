const express = require('express')
const Mos = require('../models/mosModel')
const requireAuth = require('../middleware/requireAuth')
const {getOneMos,logMos,getMos,deleteMos,createMos} = require("../Controllers/mosController")

const router = express.Router()

//router.use(requireAuth)

router.get('/', getMos)

router.post('/signup', createMos)

router.post('/login', logMos)

router.get('/:id', getOneMos)

router.delete('/:id', deleteMos)


module.exports = router