const {Employee,Designation,User,PlotBooking,Plot,Venture,Percentage} = require('../Models/models')
const bcrypt = require('bcrypt');
module.exports={
    ERegister: async (req, res) => {
        
        try {
          const { name, email, password,phone, desig_id,referralId,role } = req.body; 
          const saltRounds = 10; // Set salt rounds for bcrypt
          const hashedPassword = await bcrypt.hash(password, saltRounds);
 
          const rolee=role?role:"employee"
          // Check if user already exists
          const user = await Employee.findOne({ where: { phone } });
          if (user) {
            return res.status(400).json({ error: 'User already exists' });
          }
          // Create new user
          const newUser = await Employee.create({ name, email, password:password,phone,desig_id,referralId,role:rolee });
          return res.status(201).json(newUser);
        } catch (err) {
          console.error(err);
          return res.status(500).json({ error: 'Server error' });
        }
    },

    Get_All:async (req, res) => { 
      try {
        if(req.user.userType !== "employee" && req.user.userType !== "admin"){
          return res.status(403).json({ message: 'Access Forbidden' })}
          const page = req.body.page || 1;
           const limit = req.body.limit || 10;
            const offset = (page - 1) * limit;

        const employees = await Employee.findAll({
          where: {
            role:'employee'
          },
          include: {
            model: Designation,
            attributes: ['name']
          },  limit,
              offset
        });
        res.status(200).json({ success: true, data: employees });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
      }
    },
    getAllAgents: async (req, res) => {
      try {
       
        const employees = await Employee.findAndCountAll({
          where: {
            role: 'agent'
          },
          include:[
            {
              model:Designation,
              attributes:['name']
            }
          ],
          
       
          order: [['createdAt', 'DESC']]
        });
    
        return res.status(200).json({
          count: employees.count,
          rows: employees.rows,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }},
   
    
      getUplevelUsersByAgentId :async (req, res) => {
       
        try {
          const { emp_id } = req.params;
          let uplevelAgents = [];
      
          const findUplevelAgents = async (referralId) => {
            const uplineAgent = await Employee.findOne({ where: { emp_id:referralId }, include:[
              {
                model:Designation,
                attributes:['name'],
                include: [
                  {
                    model: Percentage,
                    attributes: ['percentage'],
                  },
                ],
              }
            ], });
            if (uplineAgent) {
              uplevelAgents.push(uplineAgent);
              if (uplineAgent.referralId) {
                await findUplevelAgents(uplineAgent.referralId);
              }
            }
          };
      
          const agent = await Employee.findOne({ where: { emp_id } });
          if (!agent) {
            return res.status(404).json({ message: 'Agent not found' });
          }
          // uplevelAgents.push(agent);
          await findUplevelAgents(agent.referralId);
      
          return res.status(200).json(uplevelAgents);
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Internal server error' });
        }
      
      },
      

    Getby_id:async (req, res) => {
      try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) {
          return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.status(200).json({ success: true, data: employee });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
      }
    },

   Updateby_id:async (req, res) => {
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin" &&req.user.userType !== "agent"){
        return res.status(403).json({ message: 'Access Forbidden' })}
      const { name, email, phone, address, designation, salary,referralId,password } = req.body;
      const employee = await Employee.findByPk(req.params.id);
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      const updateObj={}
      if(name){
        updateObj.name = name;
      }
     
      if(email){
        updateObj.email = email;
      }
      
      if(phone){
        console.log(phone)
        updateObj.phone = phone;
      }
      
      if(address){
        updateObj.address = address;
      }
      
      if(designation){
        updateObj.designation = designation;
      }
      
      if(salary){
        updateObj.salary = salary;
      }
      if(password){
        updateObj.password=password;
      }
      
      if(referralId){
        updateObj.referralId=referralId;
      }
     console.log(updateObj)
      const updatedUser = await Employee.update(updateObj, {
        where: {
          emp_id :req.params.id
        }
      });
      const updatedEmployee = await Employee.findByPk(req.params.id, {
        include: {
          model: Designation,
          attributes: ['name']
        }
      });
  
      res.status(200).json({ success: true, data: updatedEmployee });
      // res.status(200).json({ success: true, message: 'Employee Data Updated' });

      
    
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },
  Delete_id:async (req, res) => {
    const emp_id  = req.params.id;
        try {
          const user = await Employee.findOne({ where: { emp_id } });
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
          await Employee.destroy({ where: { emp_id } });
          return res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal Server Error" });
        }
  },
  getAgentEmployees: async (req, res) => {
    try {
      console.log("hello")
      const employees = await Employee.findAll({
        where: {
          role: 'agent'
        },include:[
          {
            model:Designation,
            attributes:['name']
          }
        ],
        attributes: ['emp_id', 'name'] // Add any additional attributes you want to retrieve
      });
  
      return res.status(200).json(employees);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },getUsersWithAgentPlots: async (req, res) => {
    try {
      const agentId = req.user.userId;
  
      // Get all plot bookings for the agent
      const bookings = await PlotBooking.findAll({
        where: { agent_id: agentId },
        include: [
          {
            model: Plot,
            include: [{ model: User }],
          },
        ],
      });
  
      // Extract the customer objects from the plot bookings
      const customers = bookings.map((booking) => booking.plot.customer);
  
      res.status(200).json({ success: true, data: customers });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },
  getAgent_customers: async (req, res) => {
    
    
      try {
        const { agent_id } = req.params;
    
        // Find all plots booked by the agent
        const bookedPlots = await PlotBooking.findAll({
          where: {
            agent_id: agent_id,
          },
          attributes: ['customer_id'],
        });
    
        // Extract customer IDs from bookedPlots
        const customerIds = bookedPlots.map((plot) => plot.customer_id);
    
        // Find customers with their booked plots
        const customers = await User.findAll({
          where: {
            user_id: customerIds,
          },        
         
            
          
        });
    
        res.status(200).json(customers);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Unable to fetch customers with booked plots.' });
      }
    
    
  
  
},
getDownlevelUsersByAgentId: async (req, res) => {
  try {
    const { emp_id } = req.params;
    let downlevelAgents = [];

    const findDownlevelAgents = async (empId) => {
      const downlineAgents = await Employee.findAll({
        where: { referralId: empId },
        include: [
          {
            model: Designation,
            attributes: ['name'],
            include: [
              {
                model: Percentage,
                attributes: ['percentage'],
              },
            ],
          },
        ],
      });

      if (downlineAgents.length > 0) {
        downlevelAgents.push(...downlineAgents);
        for (const agent of downlineAgents) {
          await findDownlevelAgents(agent.emp_id);
        }
      }
    };

    const agent = await Employee.findOne({ where: { emp_id } });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    await findDownlevelAgents(agent.emp_id);

    return res.status(200).json(downlevelAgents);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
},

}