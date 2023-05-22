const express =require('express');
const { GetAll, Create, UpdateById, DeleteById, GetAll_by_VentureID, getPlotUserEmployeeDetails, Post_Offer_price, getPlotDetails } = require('../Controller/plot');


const router =express.Router()


router.post("/all",GetAll);
router.post("/add",Create)
router.put("/",UpdateById)
router.delete("/:plot_id",DeleteById)
router.post("/:id",GetAll_by_VentureID)
router.post("/:plot_id",getPlotUserEmployeeDetails)
router.post("/offer/:plot_id",Post_Offer_price)
router.get('/plots/:plotId',getPlotDetails);
// router.post("/register",Create)
// router.get("/",)


module.exports = router;