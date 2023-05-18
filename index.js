const express = require('express');
const app = express();
const port = 3000;
require('dotenv').config()
const { validationResult } = require('express-validator');
//
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const sequelize = require('./Config/db');
const jwt =require('jsonwebtoken')
const cors =require('cors')
app.use(cors());
const {Venture,Phase,User,Plot, Employee, Designation,PlotBooking,Commission,Payment,PayCommission,Percentage}=require('./Models/models')
const {verifyToken}=require("./helpers/jwt_helper")
const bcrypt = require('bcrypt');
//  Import Routes
const userRouter=require('./Routes/user')


const venturesRouter=require('./Routes/ventures')
const phaseRouter=require('./Routes/phases')
const employeeRouter=require("./Routes/employee")
const designationsRouter=require("./Routes/designations")
const bookingRouter=require("./Routes/booking")
const plotRouter =require("./Routes/plot")
const paymentRouter=require("./Routes/payment")
const commissionRouter=require("./Routes/commission")
const dashboardRouter =require("./Routes/dashboard")
const expensesRouter=require("./Routes/expenses")
const adminRouter=require("./Routes/admin")

//Associations 
Venture.hasMany(Phase, {
  foreignKey: {
    name: 'venture_id'
  }
});
Venture.hasMany(Plot, {
  foreignKey: {
    name: 'venture_id'
  }
});

Venture.hasMany(Designation, { foreignKey: 'venture_id' });
Venture.hasMany(Percentage, { foreignKey: 'venture_id' });
Designation.hasMany(Percentage, { foreignKey: 'desig_id' });
Percentage.belongsTo(Venture, { foreignKey: 'venture_id' });
Percentage.belongsTo(Designation, { foreignKey: 'desig_id' });
Phase.belongsTo(Venture, {
  foreignKey: {
    name: 'venture_id'
  }
});

Plot.belongsTo(User,{
  foreignKey:{
    name:'customer_id'
  }

});
Plot.belongsTo(Phase,{
  foreignKey:{
    name:"phase_id"
  }
})

Plot.belongsTo(Venture,{
  foreignKey:{
    name:"venture_id"
  }
})


User.belongsTo(Employee,{
  foreignKey:{
    name:"agent_id"
  }
})
Employee.belongsTo(Employee,{
  foreignKey:{
    name:"referralId"
  }
});

Employee.belongsTo(Designation,{
  foreignKey:{
    name:"desig_id"
  }
})

PlotBooking.hasOne(Employee,{
  foreignKey:{
    name:"emp_id"
  }
})

PlotBooking.hasOne(User,{
  foreignKey:{
    name:'user_id'
  }

})

PlotBooking.hasOne(Plot,{
  foreignKey:{
    name:'plot_id'
  }

})
Payment.hasOne(User,{
  foreignKey:{
    name:'user_id'
  }

})

PlotBooking.belongsTo(Plot, { foreignKey: 'plot_id' });
PlotBooking.belongsTo(User, { foreignKey: 'customer_id' });
PlotBooking.belongsTo(Employee, { foreignKey: 'agent_id' });

Commission.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee'
});

Commission.belongsTo(PlotBooking, {
  foreignKey: 'booking_id',
  as: 'plotBooking'
});

Payment.belongsTo(PlotBooking, {
  foreignKey: 'booking_id',
  as: 'plotBooking'
});
Payment.belongsTo(PlotBooking, { foreignKey: 'booking_id', as: 'plot_booking' });
// define the association in Payment model
Payment.belongsTo(Venture, {
  foreignKey: 'venture_id'
});

// define the association in Venture model
Venture.hasMany(Payment, {
  foreignKey: 'venture_id'
});

Payment.belongsTo(Plot, { foreignKey: 'plot_id' });
Plot.hasMany(Payment, { foreignKey: 'plot_id' });

Employee.hasMany(Plot, { foreignKey: 'agent_id' });
Plot.belongsTo(Employee, { foreignKey: 'agent_id' });

Commission.belongsTo(Plot, { foreignKey: 'plot_id' });

PayCommission.belongsTo(Employee, { foreignKey: 'agent_id' });
PayCommission.belongsTo(Plot, { foreignKey: 'plot_id' });

Payment.belongsTo(PlotBooking);
Plot.belongsTo(Venture, { foreignKey: 'venture_id' });
// Sync the database models
// Sync the models with the database
sequelize.sync({ alter: true, force: true, hooks: true })
  .then(async () => { // Use async function to use await for bcrypt
    console.log('Database connected and models synced.');

    // Check if the admin already exists in the employee table
    const admin = await Employee.findOne({ where: { role: 'admin' } });

    if (!admin) {
      // If admin does not exist, insert admin into the employee table
      const password = process.env.PASSWORD;
      const saltRounds = 10; // Set salt rounds for bcrypt
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert designation data if not already present
      await Designation.findOrCreate({
        where: { name: 'admin' }, // Check if 'admin' designation already exists
        defaults: { name: 'admin' } // Insert 'admin' designation with null percentage if not found
      });

      // Get the 'admin' designation
      const adminDesignation = await Designation.findOne({ where: { name: 'admin' } });

      // Insert admin into the employee table
      const data = await Employee.create({
        name: process.env.ADMINNAME,
        email: process.env.EMAIL,
        phone:1234567890,
        role: process.env.ROLE,
        password:process.env.PASSWORD, // Set the hashed password
        desig_id: adminDesignation.desig_id // Set the 'admin' desig_id
      });

      console.log('Admin added to the employee table.');
    }
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
// Middleware for parsing JSON data in request bodies
app.use(express.json());




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // specify the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});


const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'text/csv') {
      const error = new Error('Only CSV files are allowed');
      error.status = 422;
      cb(error, false);
    } else {
      cb(null, true);
    }
  }
}).fields([
  { name: 'csvfile', maxCount: 1 },
  { name: 'key', maxCount: 1 },
  { name: 'text', maxCount: 1 }
]); 

app.post('/upload',verifyToken,  upload, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    if (!req.files['csvfile']) {
      return res.status(400).json({ message: 'CSV file not provided' });
    }
    if (!req.body['venture_id']) {
      return res.status(400).json({ message: 'CSV file not provided' });
    }
    if (!req.body['phase_id']) {
      return res.status(400).json({ message: 'CSV file not provided' });
    }

    const file = req.files['csvfile'][0];
    const ventureId = req.body['venture_id'];
    const phase_Id = req.body['phase_id'];

    async function insertPlotsFromCsv(results,ventureId,phase_Id) {
      // console.log(results,ventureId,phase_Id)
      try {
        
        for (let i = 0; i < results.length; i++) {
          const { plot_number, square_yards, facing, sqr_yard_price } = results[i];
          
          if (!plot_number || !square_yards || !facing || !sqr_yard_price) {
            return res.status(400).json({ message: 'Plot data is missing' });
          }
          
          const status = "available";
          const phase_id = phase_Id;
          const venture_id = ventureId;
          
          const orginal_price = sqr_yard_price * square_yards;
          const venture = await Venture.findByPk(venture_id);
          
          if (venture) {
            const data = await Plot.create({ plot_number, square_yards, facing, sqr_yard_price, orginal_price, venture_id, status, phase_id });
          } else {
            return res.status(404).json({ message: 'Venture not found' });
          }
        }
        
        res.send('Data inserted successfully');
        console.log('Data inserted successfully');
      } catch (error) {
        console.error(error);
      }
    }
    const results = [];
    fs.createReadStream(file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // Here you can update the plots table with the data from the CSV file
        // console.log(results,ventureId);
        insertPlotsFromCsv(results,ventureId,phase_Id);
        // res.send('File uploaded successfully.');
      });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});


// Custom error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // If the error was caused by multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'File size limit exceeded' });
    } else {
      res.status(400).json({ error: err.message });
    }
  } else if (err) {
    // For all other errors
    res.status(err.status || 500).json({ error: err.message });
  } else {
    next();
  }
});



app.get('/',async(req,res)=>{

  res.send("hello World")
})

app.use('/user',verifyToken,userRouter)

app.use('/ventures',verifyToken,venturesRouter)

app.use('/phase',verifyToken,phaseRouter)

app.use('/employee',verifyToken,employeeRouter)
app.use('/designations',verifyToken,designationsRouter)
app.use('/booking',verifyToken,bookingRouter)
app.use("/plots",verifyToken,plotRouter)
app.use("/payment",verifyToken,paymentRouter)
app.use("/commission",verifyToken,commissionRouter)
app.use("/dashboard",verifyToken,dashboardRouter)
app.use("/expenses",verifyToken,expensesRouter)
app.use("/",adminRouter)


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
