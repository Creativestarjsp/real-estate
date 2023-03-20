const express =require('express');
const { getCommissionsForEmployeeAndPlot, getCommissionsForEmployee, getCommissionsOfplot, createPayCommission, getPayCommissionById, getPayCommissionByagent_id, getPayCommissions, updatePayCommissionById, Test, GetAgentPaidandremainingAmount } = require('../Controller/commission');


const router =express.Router()


router.get("/:employeeId/:plot_id",getCommissionsForEmployeeAndPlot);
router.get("/:employeeId",getCommissionsForEmployee);
router.post("/plot",getCommissionsOfplot);
router.post("/pay/agent",createPayCommission)
router.get("/pay/agent/:id",getPayCommissionById)
router.post("/pay/agent/update",updatePayCommissionById)
router.get("/agent/paydeatils/:agent_id",getPayCommissionByagent_id)
router.get("/paycommissions/all/data",getPayCommissions)
// router.get("/test/data/d/a",GetAgentPaidandremainingAmount)
// router.post("/register",Create)
// router.get("/:id",getBookingPaymentDetails)
// router.put("/addpay",addPayment)


module.exports = router;