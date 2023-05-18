const { Sequelize } = require('sequelize');
// Create a new Sequelize instance
// console.log(process.env.DB,process.env.UNAME,process.env.PWD,process.env.HOST)
const sequelize = new Sequelize(process.env.MYSQLDATABASE,process.env.MYSQLUSER,process.env.MYSQLPASSWORD, {
  host: process.env.MYSQLHOST,
  dialect: 'mysql',
  port:process.env.MYSQLPORT, 
  define: {
    timestamps: true
  },
  pool: {
    max: 10, // Maximum number of connection instances in the pool
    min: 0, // Minimum number of connection instances in the pool
    acquire: 30000, // Maximum time (in milliseconds) that a connection can be idle before being released
    idle: 10000, // Maximum time (in milliseconds) that a connection can be idle before being closed
  },
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
