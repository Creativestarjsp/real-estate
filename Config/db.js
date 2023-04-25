const { Sequelize } = require('sequelize');
// Create a new Sequelize instance
// console.log(process.env.DB,process.env.UNAME,process.env.PWD,process.env.HOST)
const sequelize = new Sequelize(process.env.DB,process.env.UNAME,process.env.PWD, {
  host: process.env.HOST,
  dialect: 'mysql',
  port:process.env.PORT,
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
