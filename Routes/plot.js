const express =require('express');
const { GetAll, Create, UpdateById, DeleteById, GetAll_by_VentureID, getPlotUserEmployeeDetails, Post_Offer_price } = require('../Controller/plot');


const router =express.Router()


router.post("/all",GetAll);
router.post("/add",Create)
router.put("/:id",UpdateById)
router.delete("/:plot_id",DeleteById)
router.post("/:id",GetAll_by_VentureID)
router.post("/:plot_id",getPlotUserEmployeeDetails)
router.post("/offer/:plot_id",Post_Offer_price)
// router.post("/register",Create)
// router.get("/",)


module.exports = router;