const express =require('express');
const { ERegister } = require('../Controller/employee');
const { userLogin, Register, employeeLogin } = require('../Controller/user');
const { updateVentureStatus } = require('../Controller/dashboard');
const { CreateD } = require('../Controller/designations');
const { createPlots } = require('../Controller/plot');


const router =express.Router()


router.post("/login",userLogin);
router.post("/emp/login",employeeLogin)

router.post("/register/user",Register)
router.post("/design/add",CreateD)
router.post("/register/employee",ERegister)
router.post("/bulk/plots",createPlots)



 
module.exports = router;