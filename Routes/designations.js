const express =require('express');
const { CreateD, GetAll_D, Get_by_id, Update_by_id, Delete_by_id } = require('../Controller/designations');

const router =express.Router()

router.post('/add',CreateD)
router.get('/all',GetAll_D)
router.get('/:id',Get_by_id)
router.put('/:id',Update_by_id)
router.delete('/:id',Delete_by_id)

module.exports = router;