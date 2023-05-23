const { DataTypes } = require('sequelize');
const sequelize = require("../Config/db");

const Venture = sequelize.define('ventures', {
    venture_id : {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique:'code'
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active','inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
  },{indexes:[
    {
      
        fields: ['venture_id']
      
    }
  ],
    tableName:"venture",timestamps: true,paranoid: true});

  const Phase = sequelize.define('phase', {
    phase_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    venture_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'venture',
        key: 'venture_id'
      }
    },status: {
      type: DataTypes.ENUM('active','inactive'),
      allowNull: false,
      defaultValue: 'active',
    }
  },{indexes:[
    {
      
        fields: ['venture_id']
      
    }
  ],tableName:"phase",timestamps: true,paranoid: true});

// 
const Designation = sequelize.define('designation', {
  desig_id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique:'name'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique:'order'
  },
}, {
  indexes: [
    {
      fields: ['desig_id']
    }
  ],
  tableName: "designation",
  timestamps: true,
  paranoid: true
});

// 
const Employee = sequelize.define('employee', {
  emp_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique:'email'
  },phone: {
    type: DataTypes.BIGINT(20),
    allowNull: false,
    unique:'phone'
   
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }, payee_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  account_number: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  ifsc: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bank_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  branch: {
    type: DataTypes.STRING,
    allowNull: true
  },
  desig_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references:{
      model:"designation",
      key:"desig_id"
    }
    
  },
    referralId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references:{
      model:'employee',
      key:"emp_id"
    }
    
  },role: {
    type: DataTypes.ENUM('employee','agent','admin'),
    allowNull: false,
    defaultValue: 'employee',
  },status: {
    type: DataTypes.ENUM('active','inactive'),
    allowNull: false,
    defaultValue: 'active',
  },
},{indexes:[
  {
    
      fields: ['emp_id',"email"]
    
  }
],tableName:"employee",  timestamps: true,paranoid: true});

// 
const User = sequelize.define('user', {
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique:'email',
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.BIGINT(20),
    allowNull: false,
  },
  phone2: {
    type: DataTypes.BIGINT(20),
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  aadharNumber: {
    type: DataTypes.STRING(12),
    allowNull: true,
    field: 'aadhar_number',
  },
  pan: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
  },
  agent_id:{
    type:DataTypes.BIGINT,
    allowNull:true,
    references:{
      model:"employee",
      key:"emp_id"
    }
   
  },status: {
    type: DataTypes.ENUM('active','inactive'),
    allowNull: false,
    defaultValue: 'active',
  },
}, {indexes:[
  {
    
      fields: ['user_id']
    
  }
],tableName:"user",timestamps: true,paranoid: true})

// 
  
const Plot = sequelize.define('plot', {
  plot_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  plot_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  square_yards: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  facing: {
    type: DataTypes.STRING,
    allowNull: false
  },
  offer_price: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  sqr_yard_price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  offer_sqr_yard_price: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  orginal_price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  venture_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'venture',
      key: 'venture_id'
    } 
   },
  phase_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references:{
      model:"phase",
      key:"phase_id"
    }
   
  },
  customer_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references:{
      model:"user",
      key:"user_id"
    }    
  },
  status: {
    type: DataTypes.ENUM('available','unavailable',"hold","sold","block","unblock","registered"),
    allowNull: false,
    defaultValue: 'available',
  },
  agent_id:{
    type:DataTypes.BIGINT,
    allowNull:true,
    references:{
      model:"employee",
      key:"emp_id"
    }}
},{indexes:[
  {
    
      fields: ['plot_id']
    
  }
],tableName:"plot",timestamps: true,paranoid: true});


const PlotBooking = sequelize.define('plotbooking', {
  booking_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  plot_id: {
    type: DataTypes.BIGINT,
    allowNull: false, 
    references: {
      model: "plot",
      key: 'plot_id'
    }
  },
  customer_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references:{
      model:"user",
      key:"user_id"
    }    
  }, agent_id:{
    type:DataTypes.BIGINT,
    allowNull:true,
    references:{
      model:"employee",
      key:"emp_id"
    }
   
  },
  status: {
    type: DataTypes.ENUM("paid","cancelled"),
    allowNull: false,
    defaultValue: 'paid',
  }
  

},{indexes:[
  {
    
      fields: ['booking_id']
    
  }
],tableName:"plotbooking",timestamps: true,paranoid: true});

const Commission = sequelize.define('commission', {
  commi_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending','paid',"remark"),
    allowNull: false,
    defaultValue: 'pending',
  },
  employeeId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: "employee",
      key: 'emp_id'
    }
  },
  plotBookingId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: "plotbooking",
      key: 'booking_id'
    }
  },
  plot_id: {
    type: DataTypes.BIGINT,
    allowNull: false, 
    references: {
      model: "plot",
      key: 'plot_id'
    }}
},{indexes:[
  {
    
      fields: ['commi_id','plot_id']
    
  }
],tableName:"commission",  timestamps: true,paranoid: true});

const Payment = sequelize.define('Payment', {
  payment_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // foreign key references

  booking_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'plotbooking',
      key: 'booking_id'
    }
  },
  plot_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'plot',
      key: 'plot_id'
    }
  },
  customer_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'user',
      key: 'user_id'
    }
  },venture_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'venture',
      key: 'venture_id'
    }},
    remarks: {
      type: DataTypes.STRING
    },
}, {indexes:[
  {
    
      fields: ['payment_id']
    
  }
],
  tableName: 'payment',
  timestamps: true,
  paranoid: true
  
});

const PayCommission = sequelize.define('PayCommission', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  pay_commission: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  payment_type: {
    type: DataTypes.ENUM('pending', 'paid', 'remark'),
    allowNull: false,
    defaultValue: 'pending',
  },
  remarks: {
    type: DataTypes.STRING
  },
 
  plot_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'plot',
      key: 'plot_id'
    }
  },
  agent_id:{
    type:DataTypes.BIGINT,
    allowNull:true,
    references:{
      model:"employee",
      key:"emp_id"
    }
   
  }
}, {
  tableName: 'paycommission',
  timestamps: true,
  paranoid: true
});


const Percentage = sequelize.define('percentage', {
  per_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  percentage: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  venture_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'venture',
      key: 'venture_id'
    }},
    desig_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'designation',
      key: 'desig_id'
    }
  }
},{indexes:[
  {
    
      fields: ['per_id','venture_id']
    
  }
],
  tableName: 'percentage',
  timestamps: true,
  paranoid: true
});

const Expenditure = sequelize.define('Expenditure', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expensesType: {
    type: DataTypes.ENUM('Travel', 'Incentive', 'Food', 'Mobile', 'Salary', 'Labour expenses', 'Site expenses', 'Customer mela', 'Incidental', 'Other'),
    allowNull: false,
  },
}, {
  tableName: 'expenditure',
  timestamps: true,
  paranoid: true
});




  module.exports={Venture,Phase,Plot,User,Employee,Designation,PlotBooking,Commission,Payment,PayCommission,Expenditure,Percentage}