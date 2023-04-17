const express =require('express');
const { ERegister, Get_All, Getby_id, Updateby_id, Delete_id,  } = require('../Controller/employee');
const { updateVentureStatus, updateUserStatus, updateEmployeeStatus, updateDesignationStatus, updatePhaseStatus } = require('../Controller/dashboard');

const router =express.Router()

router.post('/employee',ERegister)
router.get('/all',Get_All)
router.get('/:id',Getby_id)
router.put('/:id',Updateby_id)
router.delete('/:id',Delete_id)
router.get('/v/status',updateVentureStatus)
router.get("/u/status",updateUserStatus)
router.get("/e/status",updateEmployeeStatus)
router.get("/d/status",updateDesignationStatus)
router.get("/p/status",updatePhaseStatus)
// router.post('/designation',CreateD)

module.exports = router;