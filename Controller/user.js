const {User,PlotBooking,Plot,Payment,Employee,Phase,Venture} = require('../Models/models')
const { body, validationResult } = require('express-validator');
const sequelize  = require("../Config/db");
const { Op } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt =require('jsonwebtoken')
const {signAccessToken}=require("../helpers/jwt_helper")
module.exports={
  
    //Get all Users
    getAllUsers: async (req, res) => {
      try {
        // Validate request query parameters
       
    
        if (req.user.userType !== "employee" && req.user.userType !== "admin") {
          return res.status(403).json({ message: 'Access Forbidden' });
        }
    
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const offset = (page - 1) * limit;
    
        const users = await User.findAll({
          attributes: ['user_id', 'name', 'email', 'phone', 'phone2', 'address', 'aadharNumber', 'pan', 'agent_id'],
          limit,
          offset
        });
    
        res.json(users);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
    },


    // get user by id
    getbyid: async (req, res) => {
      try {
        // Validate request parameters
        await param('id').isInt({ min: 1 }).withMessage('Invalid user ID').toInt().run(req);
    
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
        const id = req.params.id;
        console.log(req.user.aud)
        if (req.user.userType !== "employee" && req.user.userType !== "admin" && req.user.aud[0] != id) {
          return res.status(403).json({ message: 'Access Forbidden' });
        }
        const user = await User.findByPk(id, {
          attributes: ['user_id', 'name', 'email', 'phone', 'phone2', 'address', 'aadharNumber', 'pan', 'agent_id'],
        });
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ user });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    },


    //update user by id
    
updatebyid: async (req, res) => {
  try {
    const id = req.params.id;

    // Validate request parameters
    await param('id').isInt({ min: 1 }).withMessage('Invalid user ID').toInt().run(req);

    // Validate request body
    await body('name').optional().isString().withMessage('Invalid name').run(req);
    await body('email').optional().isEmail().withMessage('Invalid email').run(req);
    await body('phone').optional().isNumeric().withMessage('Invalid phone number').run(req);
    await body('phone2').optional().isNumeric().withMessage('Invalid secondary phone number').run(req);
    await body('address').optional().isString().withMessage('Invalid address').run(req);
    await body('aadhar').optional().isString().withMessage('Invalid Aadhar number').run(req);
    await body('pan').optional().isString().withMessage('Invalid PAN number').run(req);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateObj = {};
    if (req.body.name) {
      updateObj.name = req.body.name;
    }
    if (req.body.email) {
      updateObj.email = req.body.email;
    }
    if (req.body.phone) {
      updateObj.phone = req.body.phone;
    }
    if (req.body.phone2) {
      updateObj.phone2 = req.body.phone2;
    }
    if (req.body.address) {
      updateObj.address = req.body.address;
    }
    if (req.body.aadhar) {
      updateObj.aadhar = req.body.aadhar;
    }
    if (req.body.pan) {
      updateObj.pan = req.body.pan;
    }

    const updatedUser = await User.update(updateObj, {
      where: {
        user_id: id
      }
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},

deletebyid: async (req, res) => {
  try {
    const user_id = req.params.id;

    // Validate request parameters
    await param('id').isInt({ min: 1 }).withMessage('Invalid user ID').toInt().run(req);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.userType !== "employee" && req.user.userType !== "admin") {
      return res.status(403).json({ message: 'Access Forbidden' });
    }

    const user = await User.findOne({ where: { user_id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.destroy({ where: { user_id } });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
},
   

      Register: async (req, res) => {
        try {
          // Validate request body fields
          await body('name').notEmpty().trim().withMessage('Name is required').run(req);
          await body('email').notEmpty().trim().withMessage('Email is required').isEmail().withMessage('Invalid email format').run(req);
          await body('password').notEmpty().trim().withMessage('Password is required').run(req);
          await body('phone').notEmpty().trim().withMessage('Phone is required').isMobilePhone().withMessage('Invalid phone number format').run(req);
          // Add validation for other fields if needed
      
          // Check for validation errors
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }
      
          const { name, email, password, phone, address, aadharNumber, pan, phone2 } = req.body;
          const saltRounds = 10; // Set salt rounds for bcrypt
      
          // Check if user already exists
          const user = await User.findOne({ where: { phone } });
          if (user) {
            return res.status(400).json({ error: 'User already exists' });
          }
      
          // Create new user
          const newUser = await User.create({ name, email, password, phone, phone2, address, aadharNumber, pan });
          return res.status(201).json(newUser);
        } catch (err) {
          console.error(err);
          return res.status(500).json({ error: 'Server error' });
        }
      },
  

      getUserBookedPlots1: async (req, res) => {
        try {
          // Validate request parameters
          await param('userId').isInt({ min: 1 }).withMessage('Invalid user ID').toInt().run(req);
      
          // Check for validation errors
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }
      
          const { userId } = req.params;
          if (req.user.userType !== "employee" && req.user.userType !== "admin" && req.user.aud[0] != userId) {
            return res.status(403).json({ message: 'Access Forbidden' });
          }
          const bookedPlots = await Plot.findAll({
            where: {
              customer_id: userId,
            },
            attributes: [
              'plot_id',
              'plot_number',
              'square_yards',
              'facing',
              'status',
              'offer_price',
              'customer_id',
              [sequelize.literal('(offer_price )'), 'cost'],
              [sequelize.fn('SUM', sequelize.col('Payments.amount')), 'paid_amount'],
              [sequelize.literal('(offer_price - SUM(Payments.amount))'), 'balance'],
            ],
            include: [
              {
                model: Payment,
                attributes: [],
                required: true
              },
              {
                model: User,
                attributes: ['name'],
                required: true
              },
              {
                model: Employee,
                attributes: ['name', "phone"],
                required: true
              },
              {
                model: Venture,
                attributes: ['name'],
                required: true
              }
      
            ],
            group: ['plot_id']
          });
      
          res.status(200).json(bookedPlots);
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: 'Unable to fetch booked plots.' });
        }
      },
    
      changePassword: async (req, res, next) => {
        const { oldPassword, newPassword } = req.body;
        const id = req.user.aud[0];
      
        try {
          // Validate request body
          await body('oldPassword').notEmpty().withMessage('Old password is required').run(req);
          await body('newPassword').notEmpty().withMessage('New password is required').run(req);
      
          // Check for validation errors
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }
      
          // Check if user or employee with given id exists
          const user = await User.findOne({ where: { id } });
          const employee = await Employee.findOne({ where: { id } });
      
          if (!user && !employee) {
            return res.status(404).json({ message: "User or employee not found" });
          }
      
          // Check if old password is correct
          const isValidPassword = user ? (oldPassword === user.password) : (oldPassword === employee.password);
          if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid old password" });
          }
      
          // Update the password
          if (user) {
            await user.update({ password: newPassword });
          } else {
            await employee.update({ password: newPassword });
          }
      
          return res.status(200).json({ message: "Password updated successfully" });
        } catch (error) {
          next(error);
        }
      },
      



  //new login for admin,employee,user
  userLogin : async (req, res, next) => {
    try {
      const { password, phone } = req.body;
      let user = null;
      let userType = "";

      // Check if user exists in Employee table
      if (phone) {
        user = await Employee.findOne({ where: { phone: phone } });
      }
  
      if (user) {
        userType = user.role;
      }
  
      // If user doesn't exist in Employee table, check User table
      if (!user) {
        if (phone) {
          user = await User.findOne({ where: { phone } });
          userType = "user";
        }
      }
  
     
  
      // If user is not found in any of the tables
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Check if password is correct
      if (password !== user.password) {
        return res.status(401).json({ message: "Incorrect password" });
      }
  
      // Create JWT token
      const token = jwt.sign({ id: user.id, userType }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
  
      const accessToken = await signAccessToken({ id: user.emp_id ? user.emp_id : user.user_id, data: userType });
  
      res.json({ accessToken, userdata: user });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
 employeeLogin : async (req, res) => {
      try {
        const { email, password } = req.body;
        // Check if employee exists in Employee table
        
        const employee = await Employee.findOne({raw:true, where: { email } });
  
        // If employee not found, return error
        if (!employee) {
          return res.status(404).json({ message: "Employee not found" });
        }
    
        // Check if password is correct
        const passwordMatch = await bcrypt.compare(password, employee.password);
    
        // If password is incorrect, return error
        if (!passwordMatch) {
          return res.status(401).json({ message: "Incorrect password" });
        }
    
        // Create JWT token
        const token = jwt.sign(
          { id: employee.emp_id, userType: employee.role }, // Assuming 'emp_id' and 'role' are the correct column names in the Employee model
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );
    
        // Return token and employee data
        res.json({ accessToken: token, userdata: employee });
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    },

    getUserBookedPlots: async (req, res) => {
      try {

        const {user_id}= req.body
        const userId = req.user.aud[0]; // assuming the user id is stored in the JWT audience field
        console.log(user_id,userId)
        const user = await User.findByPk(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        const plotBookings = await PlotBooking.findAll({
          where: { customer_id: userId?userId:user_id },
          include: [
            {
              model: Plot,
              attributes: ["venture_id", "phase_id", "plot_number"],
              include: [
                {
                  model: Venture,
                  attributes: ["name"],
                },
                {
                  model: Phase,
                  attributes: ["name"],
                },
              ],
            },
            {
              model: Employee,
              attributes: ["emp_id", "name", "email", "phone"],
            },
          ],
          attributes: ["booking_id", "createdAt"],
        });
        return res.status(200).json({ plotBookings });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
    
    
}