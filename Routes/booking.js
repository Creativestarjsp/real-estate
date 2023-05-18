const express =require('express');
const { Get_All, Create, getBookingPaymentDetails, addPayment } = require('../Controller/booking');

const router =express.Router()


router.post("/all",Get_All);
router.post("/register",Create)
router.get("/:id",getBookingPaymentDetails)
router.put("/addpay",addPayment)

 
module.exports = router;