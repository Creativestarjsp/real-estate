const express =require('express');
const { ERegister, Get_All, Getby_id, Updateby_id, Delete_id, getAgentEmployees, getAllAgents,getUplevelUsersByAgentId, getUsersWithAgentPlots, getAgent_customers, getDownlevelUsersByAgentId  } = require('../Controller/employee');
const { updateVentureStatus, updateUserStatus, updateEmployeeStatus, updateDesignationStatus, updatePhaseStatus, updatePlotStatus } = require('../Controller/dashboard');

const router =express.Router()

router.post('/employee',ERegister)
router.get('/all',Get_All)
router.get('/agents/all',getAllAgents)
router.post('/agents/uplevel/:emp_id',getUplevelUsersByAgentId)
router.get('/agents/downlevel/:emp_id',getDownlevelUsersByAgentId)
router.get('/:id',Getby_id)
router.put('/:id',Updateby_id)
router.delete('/:id',Delete_id)
router.get('/v/status',updateVentureStatus)
router.get("/u/status",updateUserStatus) 
router.get("/e/status",updateEmployeeStatus)
router.get("/d/status",updateDesignationStatus)
router.get("/p/status",updatePhaseStatus)


router.get("/all/agents",getAgentEmployees)
router.get('/users/agent/:agent_id', getUsersWithAgentPlots);
router.get("/users/:agent_id",getAgent_customers)
// router.post('/designation',CreateD)

module.exports = router;