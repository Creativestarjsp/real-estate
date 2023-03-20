const express =require('express');
const { ERegister, Get_All, Getby_id, Updateby_id, Delete_id,  } = require('../Controller/employee');

const router =express.Router()

router.post('/employee',ERegister)
router.get('/all',Get_All)
router.get('/:id',Getby_id)
router.put('/:id',Updateby_id)
router.delete('/:id',Delete_id)
// router.post('/designation',CreateD)

module.exports = router;