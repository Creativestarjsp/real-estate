
const express = require("express")
const { All, create, GetbyPandV, getPlotsByVentureAndPhase, Venture_id, update } = require("../Controller/phases")

const router =express.Router()

router.get('/all',All)
router.post('/add',create)
router.post('/venturenphase',getPlotsByVentureAndPhase)
router.post('/all/phases',Venture_id)
router.put('/:phase_id', update);

module.exports = router; 