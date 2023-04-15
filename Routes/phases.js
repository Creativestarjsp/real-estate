
const express = require("express")
const { All, create, GetbyPandV, getPlotsByVentureAndPhase, Venture_id } = require("../Controller/phases")

const router =express.Router()

router.get('/all',All)
router.post('/add',create)
router.post('/venturenphase',getPlotsByVentureAndPhase)
router.post('/all/phases',Venture_id)

module.exports = router; 