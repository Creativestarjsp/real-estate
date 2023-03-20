const express =require('express');
const { Home, Register, getAllUsers, getbyid, updatebyid, deletebyid, getUserBookedPlots1 } = require('../Controller/user');
const router =express.Router()


router.post('/register',Register)
router.post("/all",getAllUsers)
router.get("/:id",getbyid)
router.post("/:id",updatebyid)
router.get("/del/:id",deletebyid)
router.get('/plots/all/:userId',getUserBookedPlots1)



module.exports = router;