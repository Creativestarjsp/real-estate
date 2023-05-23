const express =require('express');
const { Home, Register, getAllUsers, getbyid, updatebyid, deletebyid, getUserBookedPlots1, changePassword, getUserBookedPlots, changePasswordempbyAdmin, changePassworduserbyAdmin } = require('../Controller/user');
const router =express.Router()


router.post('/register',Register)
router.post('/changepassword',changePassword)
router.post('/newpassword/:id',changePasswordempbyAdmin)
router.post('/user/newpassword/:id',changePassworduserbyAdmin)
router.get("/all",getAllUsers)
router.get("/:id",getbyid)
router.put("/:id",updatebyid)
router.delete("/del/:id",deletebyid)
router.get('/plots/all/:userId',getUserBookedPlots1)
router.post('/myplots/list',getUserBookedPlots)



module.exports = router;