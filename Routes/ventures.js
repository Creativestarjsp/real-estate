const express =require('express');

const { getAllVentures, createVenture, getVentureById, updateById, deleteVentureById, getVenturePayments } = require('../Controller/ventures');

const router =express.Router()

router.post('/all',getAllVentures)
router.post('/add',createVenture)
router.get('/:id',getVentureById)
router.put('/:id',updateById)
router.delete('/:id',deleteVentureById)
router.get('/v/paymentinfo',getVenturePayments)

module.exports = router;