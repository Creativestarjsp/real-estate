
const express = require("express")
const { All, create, GetbyPandV } = require("../Controller/phases")

const router =express.Router()

router.get('/all',All)
router.post('/add',create)


module.exports = router; 