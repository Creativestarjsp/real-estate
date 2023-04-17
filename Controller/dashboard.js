const { Op } = require("sequelize");
const moment = require('moment');
const bcrypt = require('bcrypt');

const sequelize  = require("../Config/db");
const {Employee,User,Designation,PlotBooking,Plot,Commission,Payment,PayCommission,Expenditure,Venture,Phase} = require('../Models/models')
module.exports={
    dashboardData : async (req, res) => {
        try {
          if(req.user.userType !== "employee" && req.user.userType !== "admin"){
            return res.status(403).json({ message: 'Access Forbidden' })}
          // Get total number of plots
          const totalPlots = await Plot.count();
      
          // Get total plot bookings
          const totalPlotBookings = await PlotBooking.count();
      
          // Get total plot sales
            const totalPlotSales = await Plot.count({
              where: {
               status: {
                [Op.or]: ['hold', 'sold', 'registered']
              }
            },
            });
      
          // Get available plots
          const availablePlots = await Plot.count({
            where: {
              status: 'available',
            },
          });
      
          // Get total payments
          const totalPayments = await Payment.sum('amount');

            // Get total Expenditure
            const totalExpenditure = await Expenditure.sum('amount');
            // Get Todays Expenditure
            const todayExpenditure = await Expenditure.sum('amount', {
                where: {
                  createdAt: {
                    [Op.between]: [
                      moment().startOf('day').toDate(),
                      moment().endOf('day').toDate(),
                    ],
                  },
                },
              });

          // Get today's payments
          const todayPayments = await Payment.sum('amount', {
            where: {
              createdAt: {
                [Op.between]: [
                  moment().startOf('day').toDate(),
                  moment().endOf('day').toDate(),
                ],
              },
            },
          });
      
          // Get today's plot sales
          const todayPlotSales = await PlotBooking.count({
            where: {
              createdAt: {
                [Op.between]: [
                  moment().startOf('day').toDate(),
                  moment().endOf('day').toDate(),
                ],
              },
            },
          });
      
          // Get total number of agents
          const totalAgents = await Employee.count();
      
          // Get total paid commission balance
          const totalPaidCommission = await PayCommission.sum('pay_commission');
      
          // Get remaining balance
          const remainingBalance = await Commission.sum('amount') - totalPaidCommission;
      
          res.json({
            totalPlots,
            totalPlotBookings,
            totalPlotSales,
            availablePlots,
            totalPayments,
            todayPayments,
            todayPlotSales,
            totalAgents,
            totalPaidCommission,
            remainingBalance,
            totalExpenditure,
            todayExpenditure
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal server error' });
        }
      },
      createExpenditure:async (req, res) => {
        try {
          if(req.user.userType !== "employee" && req.user.userType !== "admin"){
            return res.status(403).json({ message: 'Access Forbidden' })}
          const { date, purpose, amount, remarks, mobileNumber, expensesType } = req.body;
          console.log(date, purpose, amount, remarks, mobileNumber, expensesType )
          // Validation
          if (!date || !purpose || !amount || !remarks || !mobileNumber || !expensesType) {
            return res.status(400).json({ message: 'All fields are required' });
          }
          
          if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Amount must be a number greater than 0' });
          }
      
          if (!['Travel', 'insentive', 'Food', 'Mobile', 'Salary', 'Labour expenses', 'Site expenses', 'Customer mela', 'Incidental', 'Other'].includes(expensesType)) {
            return res.status(400).json({ message: 'Expenses type is invalid' });
          }
          
          // Create the Expenditure
          const expenditure = await Expenditure.create({
            date,
            purpose,
            amount,
            remarks,
            mobileNumber,
            expensesType
          });
          
          return res.status(201).json({ expenditure });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Server error' });
        }
      },
      
// Update Expenditure by ID
updateExpenditureById : async (req, res) => {
    
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin"){
        return res.status(403).json({ message: 'Access Forbidden' })}
        const { id } = req.params;
        // Check if expenditure exists in database
        const expenditure = await Expenditure.findByPk(req.params.id);
        if (!expenditure) {
          return res.status(404).json({ error: 'Expenditure not found' });
        }
    
        // Check if the request body is not empty
        if (!Object.keys(req.body).length) {
          return res.status(400).json({ error: 'Request body is empty' });
        }
    
        // Validate the request body
        const { date, purpose, amount, remarks, mobileNumber, expensesType } = req.body;
    
        // Check if required fields are present
        if (!date || !purpose || !amount || !remarks || !mobileNumber || !expensesType) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
    
        // Check if date is a valid date
        if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
          return res.status(400).json({ error: 'Invalid date format. Expected format: YYYY-MM-DD' });
        }
    
        // Check if amount is a number
        if (isNaN(amount)) {
          return res.status(400).json({ error: 'Amount must be a number' });
        }
    
        // Update the expenditure object
        const updateObj = {
          date,
          purpose,
          amount,
          remarks,
          mobileNumber,
          expensesType,
        };
    
        const updatedExpenditure = await expenditure.update(updateObj);
    
        return res.status(200).json({ message: 'Expenditure updated successfully', expenditure: updatedExpenditure });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
  },
  
  // Get Expenditure by ID
  getExpenditureById : async (req, res) => {
    const { id } = req.params;
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin"){
        return res.status(403).json({ message: 'Access Forbidden' })}
      const expenditure = await Expenditure.findByPk(id);
      if (!expenditure) {
        return res.status(404).json({ message: 'Expenditure not found' });
      }
      return res.status(200).json({ expenditure });
    } catch (error) {
      return res.status(500).json({ message: 'Could not get expenditure' });
    }
  },
  
  // Delete Expenditure by ID
  deleteExpenditureById :async (req, res) => {
    const { id } = req.params;
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin"){
        return res.status(403).json({ message: 'Access Forbidden' })}
      const expenditure = await Expenditure.findByPk(id);
      if (!expenditure) {
        return res.status(404).json({ message: 'Expenditure not found' });
      }
      await expenditure.destroy();
      return res.status(200).json({ message: 'Expenditure deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Could not delete expenditure' });
    }
  },
  getDateWisePaymentsStatements : async (req, res) => {
    try {
      const { date } = req.body;
      console.log(date)
      const formattedDate = moment(date).format("YYYY-MM-DD");
      const paymentdate = new Date(date).toISOString()
     console.log(paymentdate,formattedDate,"pppppppp")
    
      // Get amounts spent from Expenditure
      const amountSpent = await Expenditure.sum("amount", {
        where: {
          date: formattedDate,
        },
      });
  
      // Get received amounts from Payment
      const receivedAmounts = await Payment.findAndCountAll({
where:{
  createdAt:paymentdate
}
       
      });
  
      // Get number of plot sales from PlotBooking
      const plotSales = await PlotBooking.count({
        where: {
            createdAt: {
            [Op.between]: [
              moment(formattedDate).startOf("day").toDate(),
              moment(formattedDate).endOf("day").toDate(),
            ],
          },
        },
      });
  
      // Get number of plot payments
      const plotPayments = await Payment.count({
        where: {
          createdAt:paymentdate,
        },
      });
  
      // Get data from Expenditure table
      const expenditureData = await Expenditure.findAll({
        where: {
          date: formattedDate,
        },
        attributes: ["date", "mobileNumber", "purpose", "expensesType", "remarks", "amount"],
      });
  
      // Get data from Payment table
      const paymentData = await Payment.findAll({
        where: {
          createdAt:paymentdate,
        },
       
        
      });
  
      res.json({
        amountSpent,
        receivedAmounts,
        plotSales,
        plotPayments,
        expenditureData,
        paymentData,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }},

     updateVentureStatus : async (req, res) => {
      try {
        const { id } = req.query;
        console.log(id)
        let venture = await Venture.findByPk(id);
        if (!venture) {
          return res.status(404).json({ message: "Venture not found" });
        }
        let status = "active";
        if (venture.status === "active") {
          status = "inactive";
        } else {
          status = "active";
        }
        venture.status = status;
        await venture.save();
        return res.status(200).json({ message: "Venture status updated successfully" });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
    updateUserStatus: async (req, res) => {
      try {
        const { id } = req.query;
        let status = "active";
        const user = await User.findByPk(id);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        if (user.status == "active") {
          status = "inactive";
        } else {
          status = "active";
        }
        user.status = status;
        await user.save();
        return res
          .status(200)
          .json({ message: "User status updated successfully" });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },updateEmployeeStatus: async (req, res) => {
      try {
        const { id } = req.query;
        let status = "active";
        const employee = await Employee.findByPk(id);
        if (!employee) {
          return res.status(404).json({ message: "Employee not found" });
        }
        if (employee.status == "active") {
          status = "inactive";
        } else {
          status = "active";
        }
        employee.status = status;
        await employee.save();
        return res
          .status(200)
          .json({ message: "Employee status updated successfully" });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },updatePhaseStatus: async (req, res) => {
      try {
        const { id } = req.query;
        let status = "active";
        const phase = await Phase.findByPk(id);
        if (!phase) {
          return res.status(404).json({ message: "Phase not found" });
        }
        if (phase.status == "active") {
          status = "inactive";
        } else {
          status = "active";
        }
        phase.status = status;
        await phase.save();
        return res
          .status(200)
          .json({ message: "Phase status updated successfully" });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },updateDesignationStatus: async (req, res) => {
      try {
        const { id } = req.query;
        let status = "active";
        const designation = await Designation.findByPk(id);
        if (!designation) {
          return res.status(404).json({ message: "Designation not found" });
        }
        if (designation.status == "active") {
          status = "inactive";
        } else {
          status = "active";
        }
        designation.status = status;
        await designation.save();
        return res
          .status(200)
          .json({ message: "Designation status updated successfully" });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
    checkPassward:async (req, res) => {
      const { id } = req.body;
      const { userType } = req.user; // assuming you have already authenticated the user
      console.log(id,userType)
      try {
        let password = null;
        
        if (userType === 'user') {
          const user = await User.findByPk(id);
          password = user.password;
        } else if (userType === 'employee') {
          const employee = await Employee.findByPk(id);
          password = employee.password;
        } 
        console.log(password)
        const saltRounds = 10; // Set salt rounds for bcrypt
        if (password) {
          const decryptedPassword = await bcrypt.compare(password,saltRounds);
          return res.json({ password: decryptedPassword });
        } else {
          return res.status(404).json({ message: 'User or employee not found' });
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    },
    changePassword :async (req, res) => {
     
      
      const { userType } = req.user; // assuming you have already authenticated the user
      const { oldPassword, newPassword,id } = req.body;
      console.log(id,oldPassword)
      try {
        let user = null;
        let password = null;
        if (userType === 'user') {
          user = await User.findByPk(id);
          password = user.password;
        } else if (userType === 'employee') {
          user = await Employee.findByPk(id);
          password = user.password;
        } 
    
        if (user && password) {
          const isValidPassword = await bcrypt.compare(oldPassword, password);
    
          if (isValidPassword) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            user.password = hashedPassword;
            await user.save();
            return res.json({ message: 'Password changed successfully' });
          } else {
            return res.status(400).json({ message: 'Old password is incorrect' });
          }
        } else {
          return res.status(404).json({ message: 'User or employee not found' });
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
    
    
  
  

}