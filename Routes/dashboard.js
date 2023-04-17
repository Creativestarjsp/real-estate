const express =require('express');
const { GetAgentPaidandremainingAmount } = require('../Controller/commission');
const { dashboardData, createExpenditure, updateExpenditureById, deleteExpenditureById, getExpenditureById, getDateWisePaymentsStatements, checkPassward, changePassword } = require('../Controller/dashboard');


const router =express.Router()


router.post("/agent",GetAgentPaidandremainingAmount);
router.get("/admin/stats",dashboardData)
router.post("/admin/expenses/add",createExpenditure)
router.put("/admin/expenses/:id",updateExpenditureById)
router.delete("/admin/expenses/:id",deleteExpenditureById)
router.get("/admin/expenses/:id",getExpenditureById)
router.post("/admin/daywise",getDateWisePaymentsStatements)
router.post("/admin/passward",checkPassward)
router.post("/admin/changepassword",changePassword)

// router.post("/register",Create)
// router.get("/:id",getBookingPaymentDetails)
// router.put("/addpay",addPayment)


module.exports = router;