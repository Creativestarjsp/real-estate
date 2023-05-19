const {Employee,Designation,Percentage} = require('../Models/models')


module.exports={
  
// Create designations,name must be unique 

    CreateD:async(req,res)=>{
        try {
          if(req.user.userType !== "employee" && req.user.userType !== "admin"){
            return res.status(403).json({ message: 'Access Forbidden' })}
            const { name, } = req.body;
            console.log(name)
            const existingDesignation = await Designation.findOne({ where: { name} });
            if (existingDesignation) {
             return res.status(400).json({ error: 'Designation already exists' });
            }
            const newDesignation = await Designation.create({ name });
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
      },
      getAllUsersByDesignation :async (req, res) => {
        try {
          const { desig_id } = req.params;
          let users = [];
      
          const findUplevelEmployees = async (referral_id) => {
            const upLevelEmployee = await Employee.findOne({ where: { emp_id: referral_id } });
            if (upLevelEmployee) {
              users.push({
                emp_id: upLevelEmployee.emp_id,
                name: upLevelEmployee.name,
                desig_id: upLevelEmployee.desig_id,
                designation: upLevelEmployee.designation, // Add designation property
              });
              if (upLevelEmployee.referral_id) {
                await findUplevelEmployees(upLevelEmployee.referral_id);
              }
            }
          };
      
          const employees = await Employee.findAll({ where: { desig_id } });
          if (!employees) {
            return res.status(404).json({ message: 'Employees not found' });
          }
      
          for (const employee of employees) {
            users.push({
              emp_id: employee.emp_id,
              name: employee.name,
              desig_id: employee.desig_id,
              designation: employee.designation, // Add designation property
            });
            if (employee.referral_id) {
              await findUplevelEmployees(employee.referral_id);
            }
          }
      
          return res.status(200).json(users);
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Internal server error' });
        }
      },
     
      // Create a new percentage 
createPercentage :async (req, res) => {
  try {
    const { venture_id, desig_id, percentage } = req.body;

    if(!venture_id ||!desig_id ||!percentage ){
      return res.status(400).json({ message: 'Fields are Missing' });
    }
    // Check if the percentage already exists
    const existingPercentage = await Percentage.findOne({
      where: {
        venture_id,
        desig_id,
      },
    });

    if (existingPercentage) {
      return res.status(400).json({ message: 'Percentage already exists' });
    }

    // Create the new percentage
    const newPercentage = await Percentage.create({
      venture_id,
      desig_id,
      percentage,
    });

    res.json(newPercentage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
},
updatePercentage : async (req, res) => {
  try {
    const { percentage } = req.body;
    const { per_id } = req.params;

    // Find the percentage by ID
    const existingPercentage = await Percentage.findByPk(per_id);

    if (!existingPercentage) {
      return res.status(404).json({ message: 'Percentage not found' });
    }

    // Update the percentage
    existingPercentage.percentage = percentage;
    await existingPercentage.save();

    res.json(existingPercentage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
},
deletePercentage : async (req, res) => {
  try {
    const { per_id } = req.params;

    // Find the percentage by ID
    const existingPercentage = await Percentage.findByPk(per_id);

    if (!existingPercentage) {
      return res.status(404).json({ message: 'Percentage not found' });
    }

    // Delete the percentage
    await existingPercentage.destroy();

    res.json({ message: 'Percentage deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }},
}