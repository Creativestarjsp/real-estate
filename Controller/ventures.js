const {Venture,Plot,Payment,User,Employee,PlotBooking, Phase} = require('../Models/models')
const sequelize  = require("../Config/db");
const { Op } = require('sequelize');
const moment = require('moment');
module.exports={
  
    createVenture:async (req, res) => {
        try {
          console.log(req.user)
          if(req.user.userType !== "employee" && req.user.userType !== "admin"){
            return res.status(403).json({ message: 'Access Forbidden' })}

          const { name, code, location, status } = req.body;
      
          // Validate required fields
          if (!name || !code || !location || !status) {
            return res.status(400).json({ message: 'All fields are required.' });
          }
      
    // Check if the status is valid
    if (status !== 'active' && status !== 'inactive') {
      return res.status(400).json({ message: 'Invalid status.' });
    }
          // Create a new Venture
          const venture = await Venture.create({ name, code, location, status });
      
          // Return the new Venture object
          return res.status(201).json({ venture });
        } catch (err) {
          if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'The code must be unique.' });
          }

          console.error(err);
          return res.status(500).json({ message: 'Something went wrong.' });
        }
      },

getAllVentures: async (req, res) => {
  
    try {
      const page = req.body.page || 1;
      const limit = req.body.limit || 10;
      const offset = (page - 1) * limit;
  
      const ventures = await Venture.findAll({
        include: [{ 
          model: Plot, 
          as: 'plots', 
          attributes: []

        }],
        
        group: ['venture_id'], // Use 'venture.venture_id' instead of 'venture_id'
        limit,
        offset
      });
  
      if (!ventures || ventures.length === 0) {
        return res.status(404).json({ message: 'No ventures found' });
      }
  
      res.status(200).json(ventures);
    } catch (err) {
      if (err.message.includes('Table \'estate.plot\' doesn\'t exist')) {
        return res.status(404).json({ message: 'No plots found' });
      }
  
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
},



    //get venture by id
    getVentureById:async (req, res) => {
        try {

          const venture = await Venture.findByPk(req.params.id);
          if (!venture) {
            return res.status(404).json({ message: 'Venture not found' });
          }
          return res.status(200).json(venture);
        } catch (err) {
          console.error(err);
          return res.status(500).json({ message: 'Server error' });
        }
      },

    //update venture by id
   
    updateById:async (req, res) => { 
        try {

          if(req.user.userType !== "employee" && req.user.userType !== "admin"){
            return res.status(403).json({ message: 'Access Forbidden' })}

          const { id } = req.params;
          const { name, code, location, status } = req.body;
      
          const venture = await Venture.findByPk(id);
      
          if (!venture) {
            return res.status(404).json({ message: 'Venture not found' });
          }
      
          venture.name = name || venture.name;
          venture.code = code || venture.code;
          venture.location = location || venture.location;
          venture.status = status || venture.status;
      
          await venture.save();
      
          return res.status(200).json({ message: 'Venture updated successfully', venture });
        } catch (error) {
          if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'The code must be unique.' });
          }
          return res.status(500).json({ message: error.message });
        }
      },

    //delete Venture by id
  deleteVentureById:async (req, res) => {
      try {
        if(req.user.userType !== "employee" && req.user.userType !== "admin"){
          return res.status(403).json({ message: 'Access Forbidden' })}

        const venture_id = req.params.id;
        
        // Find the Venture to delete
        const venture = await Venture.findByPk(venture_id);
    
        // Check if the Venture exists
        if (!venture) {
          return res.status(404).json({ message: 'Venture not found.' });
        }
    
        // Delete the Venture
        await Venture.destroy({ where: { venture_id } });
    
        return res.status(200).json({ message: 'Venture deleted successfully.' });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong.' });
      }
    },
    
    getVentureBookings: async (req, res) => {
      try {
        const { venture_id ,page = 1, pageSize = 10} = req.body;
        console.log(venture_id);
        
    
        const venturePaymentInfo = await PlotBooking.findAndCountAll({
          attributes: ['booking_id', 'createdAt', 'status'],
          limit: pageSize,
          offset: (page - 1) * pageSize,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: Plot,
              attributes: ['plot_number', 'phase_id', 'status', 'offer_price'],
              include: [
                {
                  model: Phase,
                  attributes: ['name'],
                },
              ],
              where: {
                venture_id:venture_id, // Use shorthand syntax
              },
            },
            {
              model: User,
              attributes: ['name', 'phone','user_id'],
            },
            {
              model: Employee,
              attributes: ['name'],
            },
          ],
        });
    
        return res.status(200).json({
          count: venturePaymentInfo.count,
          rows: venturePaymentInfo.rows,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    },
    
//not working
getVenturePayments: async (req, res) => {
  try {
    const { venture_id } = req.body;
    const { page = 1, pageSize = 10 } = req.query;

    const venturePaymentInfo = await PlotBooking.findAndCountAll({
      attributes: ['booking_id', 'createdAt',"status"],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']],
      include: [ 
        {
          model: Plot,
          attributes: ['plot_number', 'phase_id', 'status', 'offer_price'],
          where: {
            venture_id: venture_id,
          },
          include: [
            {
              model: Phase,
              attributes: ['name'],
            },
          ],
        },
        {
          model: User,
          attributes: ['name', 'phone'],
        },
        {
          model: Payment,
          attributes: ['payment_id', 'amount'],
          
        },
        {
          model: Employee,
          attributes: ['name'],
        },
      ],
    });
    

    return res.status(200).json({
      count: venturePaymentInfo.count,
      rows: venturePaymentInfo.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
},
getVentureStats : async (req, res) => {
  try {
    const { venture_id } = req.params;

    // Get today's bookings count
    const todayBookingsCount = await PlotBooking.count({
      where: {
        venture_id,
        createdAt: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0), // Today's date
        },
      },
    });

    // Get total bookings count
    const totalBookingsCount = await PlotBooking.count({
      where: {
        venture_id,
      },
    });

    res.status(200).json({ todayBookingsCount, totalBookingsCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch venture stats.' });
  }},


 
}