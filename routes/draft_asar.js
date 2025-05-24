const express = require('express')
const Asar= require('../models/asarModel')
const requireAuth = require('../middleware/requireAuth')
const { getDraftAsar, getOneDraftAsar, createDraftAsar, updateDraftAsar, deleteDraftAsar } = require("../Controllers/draftAsarController")

const router = express.Router()

//router.use(requireAuth)

router.get('/', getDraftAsar)

router.get('/:id', getOneDraftAsar)

router.post('/:id', createDraftAsar)

router.delete('/:id', deleteDraftAsar)

router.patch('/:id', updateDraftAsar)

module.exports = router