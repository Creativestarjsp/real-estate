const {Employee,Designation} = require('../Models/models')


module.exports={
  
// Create designations,name must be unique 

    CreateD:async(req,res)=>{
        try {
          if(req.user.userType !== "employee" && req.user.userType !== "admin"){
            return res.status(403).json({ message: 'Access Forbidden' })}
            const { name, percentage } = req.body;
            console.log(name,percentage)
            const desg_name = await Designation.findOne({ where: { name } });
            if (desg_name) {
              return res.status(400).json({ error: 'Designation already exists' });
            }
            const newDesignation = await Designation.create({ name, percentage });
            res.json(newDesignation);
          } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
          }
    },


    // GET all designations

    GetAll_D:async (req, res) => {
        try {
          if(req.user.userType !== "employee" && req.user.userType !== "admin"){
            return res.status(403).json({ message: 'Access Forbidden' })}
          const designations = await Designation.findAll();
          res.json(designations);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
      },

      // GET a single designation

      Get_by_id:async (req, res) => {
        try {
          const designation = await Designation.findByPk(req.params.id);
          if (!designation) {
            return res.status(404).json({ msg: 'Designation not found' });
          }
          res.json(designation);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
      },

      Update_by_id: async (req, res) => {
        try {
          if(req.user.userType !== "employee" && req.user.userType !== "admin"){
            return res.status(403).json({ message: 'Access Forbidden' })}
            const { name, percentage } = req.body;
            const updateObj = {};

            // Check if properties exist in request body and validate them
            if (name) {
            if (typeof name !== 'string') {
            return res.status(400).json({ msg: 'Name must be a string' });
            }
            updateObj.name = name;
            }
            if (percentage) {
            if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
            return res.status(400).json({ msg: 'Percentage must be a number between 0 and 100' });
            }
            updateObj.percentage = percentage;
            }

            const designation = await Designation.findByPk(req.params.id);
            if (!designation) {
              return res.status(404).json({ msg: 'Designation not found' });
            }
          
            // Update the designation record with the validated inputs
            await designation.update(updateObj);
            res.json(designation);


        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
      },

      Delete_by_id:async (req, res) => {
        try {
          if(req.user.userType !== "employee" && req.user.userType !== "admin"){
            return res.status(403).json({ message: 'Access Forbidden' })}
          const designation = await Designation.findByPk(req.params.id);
          if (!designation) {
            return res.status(404).json({ msg: 'Designation not found' });
          }
          await designation.destroy();
          res.json({ msg: 'Designation deleted' });
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
      }

}