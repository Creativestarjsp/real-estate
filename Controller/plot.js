const { Op } = require("sequelize");
const sequelize = require("../Config/db");
const { Plot ,Phase,Venture,User,Employee} = require('../Models/models')

module.exports = {
  // GET /plots
  GetAll: async (req, res) => {
    try {
    

   
    
      const plots = await Plot.findAll({
        include: [
          { 
            model: Phase, 
            attributes: ['name'], 
           
            include: [
              { 
                model: Venture, 
                attributes: ['name']
              }
            ] 
          }
        ], 
       
      });
    
      res.status(200).json({ success: true, data: plots });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },
// GET /plots by venture ID

GetAll_by_VentureID: async (req, res) => {
  try {
   
    const vid=req.params.id
    const plots = await Plot.findAll({
      where: { venture_id: vid },
    
    });
    
        res.status(200).json({ success: true, data: plots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
},

  // GET /plots/:plotId
  GetById: async (req, res) => {
    const { plot_id } = req.params;
    try {
      const plot = await Plot.findByPk(plot_id);
      if (!plot) {
        return res.status(404).json({ success: false, message: "Plot not found" });
      }
      res.status(200).json({ success: true, data: plot });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },

  // POST /plots
  Create: async (req, res) => {
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin"){
        return res.status(403).json({ message: 'Access Forbidden' })}

      const {venture_id,phase_id, plot_number, square_yards,sqr_yard_price,facing } = req.body;
     
        const updateObj = {};
        const venture = await Venture.findByPk(venture_id);
      
        if (!venture) {
          return res.status(404).json({ message: 'Venture not found' });
        }
        const phase = await Phase.findByPk(phase_id);
        if (!phase) {
          return res.status(404).json({ message: 'Phase not found' });
        }
        // Check if properties exists in request body
        if (plot_number) {
          updateObj.plot_number = plot_number;
        }
        if (venture_id) {
          updateObj.venture_id = venture_id;
        }
        if (phase_id) {
          updateObj.phase_id = phase_id;
          updateObj.status="available"
        }
        if (square_yards) {
          updateObj.square_yards = req.body.square_yards;
        }
        if (sqr_yard_price) {
          updateObj.sqr_yard_price = req.body.sqr_yard_price;
        }
        if (facing) {
          updateObj.facing = facing;
          const total= square_yards*sqr_yard_price;
          updateObj.orginal_price = total;
        }
      
      
      const plot = await Plot.create(updateObj);
      res.status(201).json({ success: true, data: plot });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },

  // PUT /plots/:plotId
  UpdateById: async (req, res) => {
    
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin"){
        return res.status(403).json({ message: 'Access Forbidden' })}

      const { plot_id } = req.params;
      const {venture_id,phase_id, plot_number, square_yards,sqr_yard_price,facing } = req.body;
     

      const Plot_data = await Plot.findByPk(plot_id)
      if (!Plot_data) {
        return res.status(404).json({ message: 'Plot not found' });
      }
      const updateObj = {};
      const venture = await Venture.findByPk(venture_id);
     
    
      if (!venture) {
        return res.status(404).json({ message: 'Venture not found' });
      }
      const phase = await Phase.findByPk(phase_id);
      if (!phase) {
        return res.status(404).json({ message: 'Phase not found' });
      }
      // Check if properties exists in request body
      if (plot_number) {
        updateObj.plot_number = plot_number;
      }
      if (venture_id) {
        updateObj.venture_id = venture_id;
      }
      if (phase_id) {
        updateObj.phase_id = phase_id;
        updateObj.status="available"
      }
      if (square_yards) {
        updateObj.square_yards = req.body.square_yards;
      }
      if (sqr_yard_price) {
        updateObj.sqr_yard_price = req.body.sqr_yard_price;
        const total= square_yards*sqr_yard_price;
        updateObj.orginal_price = total;
      }
      if (facing) {
        updateObj.facing = facing;
       
      }
    
      const plots = await Plot.update(updateObj, {
        where: { plot_id: plot_id },
      
      });
     
      res.status(200).json({ success: true, data: plots });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },

  // DELETE /plots/:plotId
  DeleteById: async (req, res) => {
    const { plot_id } = req.params;
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin"){
        return res.status(403).json({ message: 'Access Forbidden' })}

      const deletedCount = await Plot.destroy({
        where: { plot_id: plot_id }
      });
      if (deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Plot not found" });
      }
      res.status(200).json({ success: true, data: {} });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },
  getPlotUserEmployeeDetails:async (req, res) => {
    try {
      const { plot_id } = req.params;
  
      const plot = await Plot.findByPk(plot_id, {
        include: [{
          model: User,
          attributes: ['user_id', 'name', 'email', 'phone1']
        }, {
          model: Employee,
          attributes: ['emp_id', 'name', 'email', 'phone']
        }]
      });
  
      if (!plot) {
        return res.status(404).json({ error: 'Plot not found' });
      }
  
      return res.json({ plot, user: plot.User, employee: plot.Employee });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
  Post_Offer_price:async (req, res) => {
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin"){
        return res.status(403).json({ message: 'Access Forbidden' })}

      const { plot_id } = req.params;
      const {offer_sqr_yard_price}=req.body
      const updateObj={} 
      if(!plot_id){
        return res.status(404).json({ error: 'Plot Id should not empty' });
      }
    
      const plot = await Plot.findByPk(plot_id);
  
      if (!plot) {
        return res.status(404).json({ error: 'Plot not found' });
      }
      if(offer_sqr_yard_price){
        updateObj.offer_sqr_yard_price = offer_sqr_yard_price;
        updateObj.offer_price = offer_sqr_yard_price*plot.square_yards;
      }
      const plots = await Plot.update(updateObj, {
        where: { plot_id: plot_id },
      
      });

      if(plots[0]==0){
        return res.status(400).json({ success: false, message:"Something Went Wrong" });
      }
      return res.status(420).json({ success: true, data:plots });
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
   getPlotDetails :async(req, res)=> {
    try {
      const plotId = req.params.plotId;
  
      // Fetch plot details
      const plot = await Plot.findByPk(plotId);
      if (!plot) {
        return res.status(404).json({ error: 'Plot not found' });
      }
  
      // Return the plot details
      return res.json(plot);
    } catch (error) {
      console.error('Error fetching plot details:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },createPlots: async (req, res) => {
    let transaction; // Define the transaction variable
  
    try {
      const { plots } = req.body; // Assuming the array of plots is in the req.body as "plots"
      console.log(plots, "me");
  
      transaction = await sequelize.transaction(); // Assign the transaction value
  
      // Insert the plots into the table within the transaction
      await Plot.bulkCreate(plots, { transaction });
  
      console.log('Plots inserted successfully.');
  
      // Commit the transaction
      await transaction.commit();
  
      res.status(201).json({ success: true, message: 'Plots created successfully.' });
    } catch (error) {
      console.error('Error inserting plots:', error);
  
      if (transaction) {
        await transaction.rollback(); // Rollback the transaction on error
      }
  
      res.status(500).json({ success: false, message:error });
    }
  },
  

};


