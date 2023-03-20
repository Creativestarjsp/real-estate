const {User,PlotBooking,Plot,Payment,Employee} = require('../Models/models')
const sequelize  = require("../Config/db");
const { Op } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt =require('jsonwebtoken')
const {signAccessToken}=require("../helpers/jwt_helper")
module.exports={
  
    //Get all Users
    getAllUsers:async (req, res) => {
      try {
      
        if(req.user.userType !== "employee" && req.user.userType !== "admin"){
          res.status(403).json({ message: 'Access Forbidden' })
        } else {
          const page = req.body.page || 1;
          const limit = req.body.limit || 10;
          const offset = (page - 1) * limit;
          
          const users = await User.findAll({
            attributes: ['user_id', 'name', 'email','phone','phone2','address','aadharNumber','pan','agent_id'],
            limit,
            offset
          });
    
          res.json(users);
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
    },
    


    // get user by id
    getbyid:async (req, res) => {
      try {
        const id = req.params.id;
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
    updatebyid:async (req, res) => {
        
      
        try {
         
          const id = req.params.id;
          if (req.user.userType !== "employee" && req.user.userType !== "admin" && req.user.aud[0] != id) {
            return res.status(403).json({ message: 'Access Forbidden' });
          }
           const updateObj = {};
      
        // Check if properties exists in request body
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

    //delete user by id
    deletebyid:async (req, res) => {
        const 	user_id  = req.params.id; 
        try {

          if(req.user.userType !== "employee" && req.user.userType !== "admin"){
           return res.status(403).json({ message: 'Access Forbidden' })}

          const user = await User.findOne({ where: { 	user_id } });
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
          await User.destroy({ where: { 	user_id } });
          return res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal Server Error" });
        }
      },

   

    Register: async (req, res) => {
       
        try {
          
          const { name, email, password, phone1,address,aadharNumber,pan } = req.body;
          const saltRounds = 10; // Set salt rounds for bcrypt
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          // Check if user already exists
          const user = await User.findOne({ where: { email } });
          if (user) {
            return res.status(400).json({ error: 'User already exists' });
          }
          // Create new user
          const newUser = await User.create({ name, email, password:hashedPassword, phone1,address,aadharNumber,pan });
          return res.status(201).json(newUser);
        } catch (err) {
          console.error(err);
          return res.status(500).json({ error: 'Server error' });
        }
    },
  

    getUserBookedPlots1:async (req, res) => {
      try {
        
        const { userId } = req.params;
        if (req.user.userType !== "employee" && req.user.userType !== "admin" && req.user.aud[0] != userId) {
          return res.status(403).json({ message: 'Access Forbidden' });
        }
        const bookedPlots = await Plot.findAll({
          where: {
            customer_id:userId,
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
            [sequelize.fn('SUM', sequelize.col('payments.amount')), 'paid_amount'],
            [sequelize.literal('(offer_price - SUM(payments.amount))'), 'balance'],
          ],
          include: [
            {
              model: Payment,
              attributes: [],
              required: true
            },{
              model:User,
              attributes:['name'],
              required:true
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

    //Login user and employee
    userLogin :async (req, res, next) => {
      
  try {
    const { email, password,phone } = req.body;
    // Check if user exists in User table
    
    
    let user =null
    let userType = "";
    if(email) {
      user = await Employee.findOne({ where: { email }});
    }
   
    if(user){userType=user.role}

    // If user doesn't exist in User table, check Employee table
    if (!user) {
      if(phone){
       user = await User.findOne({ where: { phone } });
       userType = "user";
      }
    }

    // If user is not found in both User and Employee tables
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if password is correct
    const passwordMatch = await bcrypt.compare(password,user.password);
     
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Create JWT token
    const token = jwt.sign({ id: user.id, userType }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
   
    const accessToken = await signAccessToken({id:user.emp_id?user.emp_id:user.user_id,data:userType})

    res.json({ accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
    },
}