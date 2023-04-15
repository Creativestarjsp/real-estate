const express =require('express');
const { ERegister } = require('../Controller/employee');
const { userLogin, Register } = require('../Controller/user');
const { updateVentureStatus } = require('../Controller/dashboard');


const router =express.Router()


router.post("/login",userLogin);
router.post("/register/user",Register)
router.post("/register/employee",ERegister)



 
module.exports = router;