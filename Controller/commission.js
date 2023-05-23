const {Employee,User,Designation,PlotBooking,Plot,Commission,Payment,PayCommission, Venture} = require('../Models/models')
const { Op } = require("sequelize");
const sequelize  = require("../Config/db");
module.exports={

    
    getCommissionsForEmployeeAndPlot: async (req, res) => {
        try {
          if(req.user.userType !== "employee" && req.user.userType !== "admin" && req.user.userType !== "agent"){
            return res.status(403).json({ message: 'Access Forbidden' })}
          const employeeId = req.params.employeeId;
          const plot_id = req.params.plot_id;
      
          const commissions = await Commission.findAll({
            where: {
              employeeId: employeeId,
              plot_id: plot_id
            },
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['name'] 
              }]
          });
      
          res.status(200).json({
            success: true,
            data: commissions
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({
            success: false,
            message: 'Server error'
          });
        }
      },
      getCommissionsForEmployee: async (req, res) => {
        try {
          if(req.user.userType !== "employee" && req.user.userType !== "admin" && req.user.userType !== "agent"){
            return res.status(403).json({ message: 'Access Forbidden' })}

          const employeeId = req.params.employeeId;
         
      
          const commissions = await Commission.findAll({
            where: {
              employeeId: employeeId,
              
            },include: [{
                model: Employee,
                as: 'employee',
                attributes: ['name'] 
              },
              {
                model:Plot,
                attributes:["plot_number"],
                include:[{                  
                    model:Venture,
                    attributes:["name"]                  
                },
              {
                model:User,
                
              }]
              },

            ]
          });
      
          res.status(200).json({
            success: true,
            data: commissions
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({
            success: false,
            message: 'Server error'
          });
        }
      },
      getCommissionsOfplot: async (req, res) => {
        try {
          if(req.user.userType !== "employee" && req.user.userType !== "admin" && req.user.userType !== "agent"){
            return res.status(403).json({ message: 'Access Forbidden' })}
        //   const employeeId = req.params.employeeId;
          const {plot_id }= req.body
            if(!plot_id){
                res.status(500).json({
                    success: false,
                    message: 'Send Valid data'
                  });
            }
          const commissions = await Commission.findAll({
            where: {
                plot_id:plot_id
              
            },include: [{
                model: Employee,
                as: 'employee',
                attributes: ['name'] 
              }]
          });
      
          res.status(200).json({
            success: true,
            data: commissions
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({
            success: false,
            message: 'Server error'
          });
        }
      },
      createPayCommission: async (req, res) => {
        try {
          if(req.user.userType !== "employee" && req.user.userType !== "admin"){
            return res.status(403).json({ message: 'Access Forbidden' })}
          const { pay_commission, payment_type, remarks, plot_id, agent_id } = req.body;
          console.log(pay_commission)
          // check if plot_id exists in the Plot table
          const plot = await Plot.findByPk(plot_id);
          if (!plot) {
            return res.status(400).json({
              success: false,
              message: `Plot with id ${plot_id} does not exist`
            });
          }
          
          // check if agent_id exists in the Employee table
          const agent = await Employee.findByPk(agent_id);
          if (agent && agent.role !== 'agent') {
            return res.status(400).json({
              success: false,
              message: `Employee with id ${agent_id} is not an agent`
            });
          }
    
          const payCommission = await PayCommission.create({
            pay_commission,
            payment_type,
            remarks,
            plot_id,
            agent_id
          });
    
          res.status(201).json({
            success: true,
            data: payCommission
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({
            success: false,
            message: 'Server error'
          });
        }
      },
      // Get a single PayCommission by ID
  getPayCommissionById: async (req, res) => {
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin" && req.user.userType !== "agent"){
        return res.status(403).json({ message: 'Access Forbidden' })}
      const id = req.params.id;

      const payCommission = await PayCommission.findByPk(id, {
        include: [
          { model: Plot,attributes: ['plot_number',"facing","offer_price","offer_sqr_yard_price","customer_id","venture_id","phase_id"]   },
          { model: Employee, attributes: ['name']  }
        ]
      });
      if (!payCommission) {
        return res.status(404).json({
          success: false,
          message: 'Commission not found'
        });
      }

      res.status(200).json({
        success: true,
        data: payCommission
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  getPayCommissionByPlotId: async (req, res) => {
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin" && req.user.userType !== "agent"){
        return res.status(403).json({ message: 'Access Forbidden' })}
      const id = req.params.id;

      const payCommission = await PayCommission.findByPk(id, { where: {
        plot_id:plot_id
      
    },include: [
          { model: Plot,attributes: ['plot_number',"facing","offer_price","offer_sqr_yard_price","customer_id","venture_id","phase_id"]   },
          { model: Employee, attributes: ['name']  }
        ]
      });
      if (!payCommission) {
        return res.status(404).json({
          success: false,
          message: 'Commission not found'
        });
      }

      res.status(200).json({
        success: true,
        data: payCommission
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },
  
  getPayCommissionByagent_id: async (req, res) => {
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin" && req.user.userType !== "agent"){
        return res.status(403).json({ message: 'Access Forbidden' })}
      const agent_id = req.params.agent_id;
console.log(agent_id)
const payCommissions = await PayCommission.findAll({
    where: {
      agent_id:agent_id
    },
        include: [
         
          { model: Employee, attributes: ['name']  }
        ]
      });
      if (!payCommissions) {
        return res.status(404).json({
          success: false,
          message: 'Commission not found'
        });
      }

      res.status(200).json({
        success: true,
        data: payCommissions
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },
   // Get all PayCommissions
   getPayCommissions: async (req, res) => {
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin" && req.user.userType !== "agent"){
        return res.status(403).json({ message: 'Access Forbidden' })}
      const pageSize = 10; // Number of items to return per page
      const page = req.body.page ? parseInt(req.body.page) : 1; // Page number  
      // Calculate the offset and limit for pagination
      const offset = (page - 1) * pageSize;
      const limit = pageSize;
  
      // Start date
      if(!req.body.startDate){
        return res.status(404).json({
            success: false,
            message: 'startDate  not found'
          });
      }
        // End date
      if(!req.body.endDate){
        return res.status(404).json({
            success: false,
            message: 'endDate  not found'
          });
      }
  
      const startDate = new Date(req.body.startDate).toISOString()
      const endDate = new Date(req.body.endDate).toISOString()
    
      const payCommissions = await PayCommission.findAndCountAll({
       
        where: sequelize.literal(`DATE(PayCommission.createdAt) BETWEEN '${startDate}' AND '${endDate}'`),
        
        limit: limit,
        offset: offset,
        
        order: [['createdAt', 'DESC']] // Order by created date in descending order
      });
  
      const totalPages = Math.ceil(payCommissions.count / pageSize);
  
      res.status(200).json({
        success: true,
        data: payCommissions.rows,
        currentPage: page,
        totalPages: totalPages
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
  
  ,

  updatePayCommissionById: async (req, res) => {
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin"){
        return res.status(403).json({ message: 'Access Forbidden' })}
      const {id} = req.body;
      if(!id){
        res.status(400).json({
            success: false,
            message: 'Send Valid Data'
          });
      }
      console.log(id,"kjhljkgg")
      const updateObj = {};

      // Check if properties exists in request body
      if (req.body.pay_commission) {
        updateObj.pay_commission = req.body.pay_commission;
      }
      if (req.body.payment_type) {
        updateObj.payment_type = req.body.payment_type;
      }
      if (req.body.remarks) {
        updateObj.remarks = req.body.remarks;
      }
      if (req.body.plot_id) {
        // Check if the plot exists
        const plot = await Plot.findByPk(req.body.plot_id);
        if (!plot) {
          return res.status(400).json({
            success: false,
            message: 'Invalid plot ID'
          });
        }
        updateObj.plot_id = req.body.plot_id;
      }
      if (req.body.agent_id) {
        // Check if the agent exists
        const agent = await Employee.findByPk(req.body.agent_id);
        if (!agent) {
          return res.status(400).json({
            success: false,
            message: 'Invalid agent ID'
          });
        }
        updateObj.agent_id = req.body.agent_id;
      }

      // Check if the PayCommission exists
      const payCommission = await PayCommission.findByPk(id);
      if (!payCommission) {
        return res.status(404).json({
          success: false,
          message: 'PayCommission not found'
        });
      }

      // Update the PayCommission
      const payCommissions =await payCommission.update(updateObj, {
        where: {
          id: id
        }
      });

      res.status(200).json({
        success: true,
        data:payCommissions,
        message: 'PayCommission updated successfully'
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  

  //Agent Paid and remaining balance
  GetAgentPaidandremainingAmount: async (req, res) => {
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin" && req.user.userType !== "agent"){
        return res.status(403).json({ message: 'Access Forbidden' })}
      const { agent_id } = req.body;
      const employee = await Employee.findByPk(agent_id);
  
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
  
      // Calculate total commission amount from Commission table
      const commissionAmount = await Commission.sum('amount', {
        where: {employeeId:agent_id },
      });
  
      // Calculate total paid commission amount from PayCommission table
      const paidCommissionAmount = await PayCommission.sum('pay_commission', {
        where: { agent_id },
      });
  
      // Calculate remaining commission balance
      const remainingBalance = commissionAmount - paidCommissionAmount;
  
      // Return response with calculated values
      return res.json({
        totalCommissionAmount: commissionAmount,
        totalPaidCommissionAmount: paidCommissionAmount,
        remainingCommissionBalance: remainingBalance,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }


    
}