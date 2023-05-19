const express =require('express');
const { CreateD, GetAll_D, Get_by_id, Update_by_id, Delete_by_id,createPercentage,updatePercentage,deletePercentage,getAllUsersByDesignation, getAllPercentages } = require('../Controller/designations');

const router =express.Router()

router.post('/add',CreateD)
router.get('/all',GetAll_D)
router.get('/:id',Get_by_id)
router.put('/:id',Update_by_id)
router.delete('/:id',Delete_by_id)
router.get('/uplevel_agent/:desig_id',getAllUsersByDesignation)

// Create a new percentage
router.post('/percentage', createPercentage);

// Update an existing percentage
router.put('/percentage/:percentageId', updatePercentage);

// Delete a percentage
router.delete('/percentage/:percentageId', deletePercentage);
router.get('/percentage/all',getAllPercentages);

module.exports = router;