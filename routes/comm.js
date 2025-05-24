const express = require('express')
const Cons = require('../models/consModel')
const requireAuth = require('../middleware/requireAuth')
const {createComm,logComm,getOneComm,approveComm,getComm,deleteComm,getFalseComm,getTrueComm,approveMember,removeMember} = require("../Controllers/commController")

const router = express.Router()

router.get('/', getComm)
router.get('/false', getFalseComm)
router.get('/true', getTrueComm)
router.post('/signup', createComm)
router.post('/login', logComm)
router.get('/:id', getOneComm)
router.delete('/:id', deleteComm)
router.post('/approve/:id', approveComm)
router.put('/accept/:id', approveMember)
router.put('/remove/:id', removeMember)


module.exports = router