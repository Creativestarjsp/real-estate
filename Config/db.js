const { Sequelize } = require('sequelize');
// Create a new Sequelize instance
console.log(process.env.DB,process.env.UNAME,process.env.PWD,process.env.HOST)
const sequelize = new Sequelize("nbmliven_estate","nbmliven_estate1","estate@123", {
  host: "nbmlive.net",
  dialect: 'mysql',
  port:3306,
 
  // logging: (...msg)=>console.log(msg),
  logging:false,
  define: {
    timestamps: true
  }
});

// Test the database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = sequelize;
