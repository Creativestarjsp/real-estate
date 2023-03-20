const express = require('express');
const router = express.Router();
const paymentController = require('../Controller/payment');

// Route for fetching payment details for a booked plot
router.get('/booked_plots/:id', paymentController.getPaymentDetails);
router.post('/all',paymentController.AllPaymentDetails)
// Route for adding a new payment
router.post('/payments', paymentController.addPayment);
router.post('/user/:userId',paymentController.getAllUserPayments)


module.exports = router;
