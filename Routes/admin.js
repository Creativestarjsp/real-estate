const express =require('express');
const { ERegister } = require('../Controller/employee');
const { userLogin, Register } = require('../Controller/user');


const router =express.Router()


router.post("/login",userLogin);
router.post("/register/user",Register)
router.post("/register/employee",ERegister)



module.exports = router;