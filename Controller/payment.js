const { Op } = require('sequelize');
const { Payment, Plot, Venture, User,PlotBooking,Employee,Phase } = require('../Models/models');



 exports.getPaymentDetails = async (req, res) => {
  
    
    try {
      const paymentId = req.params.id;
      const paymentDetails = await Payment.findAll({
        include: [{
          model: PlotBooking,
          as: 'plotBooking',
          include: [{
            model: Plot,
            as: 'plot',
            attributes: ['plot_id','plot_number','orginal_price','offer_price','status'] 
          }, {
            model: User,
            as: 'user',
            attributes: ['name'] 
          },
          {
            model: Employee,
            as: 'employee',
            attributes: ['name'] 
          }]
        }],
        where: {
          payment_id: paymentId,
        },
        attributes: ['payment_id', 'amount', 'payment_method'],
      });
  
      if (!paymentDetails) {
        return res.status(404).json({ message: 'Payment details not found' });
      }
  
      return res.json(paymentDetails);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server Error' });
    }
};


exports.AllPaymentDetails = async (req, res) => {
  
    
  try {
    if(req.user.userType !== "employee" && req.user.userType !== "admin"){
      return res.status(403).json({ message: 'Access Forbidden' })}
      
     const page = req.body.page || 1;
      const limit = req.body.limit || 10;
      const offset = (page - 1) * limit;
    // const paymentId = req.params.id;
    const paymentDetails = await Payment.findAll({
      include: [{
        model: PlotBooking,
        as: 'plotBooking',
        include: [{
          model: Plot,
          as: 'plot',
          attributes: ['plot_id','plot_number','orginal_price','offer_price','status'] 
        }, {
          model: User,
          as: 'user',
          attributes: ['name'] 
        },
        {
          model: Employee,
          as: 'employee',
          attributes: ['name'] 
        }]
      }],
    
      attributes: ['payment_id', 'amount', 'payment_method'],
      limit,
      offset
    });

    if (!paymentDetails) {
      return res.status(404).json({ message: 'Payment details not found' });
    }

    return res.json(paymentDetails);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.addPayment = async (req, res, next) => {
  try {
    if(req.user.userType !== "employee" && req.user.userType !== "admin"){
      return res.status(403).json({ message: 'Access Forbidden' })}
    const { plot_id, name, phone_no, agent_name, sqr_yard_price, company_price_sqr_yrds, offer_price, basic_sqr_yards, basic_payable_amount, paid_amount, balance, agent_commission } = req.body;

    const plot = await Plot.findByPk(plot_id);
    if (!plot) {
      const error = new Error('Plot not found.');
      error.statusCode = 404;
      throw error;
    }

    const payment = await Payment.create({
      plot_no: plot.plot_no,
      plot_id: plot.id,
      name,
      phone_no,
      agent_name,
      sqr_yard_price,
      company_price_sqr_yrds,
      offer_price,
      basic_sqr_yards,
      basic_payable_amount,
      paid_amount,
      balance,
      agent_commission,
    });

    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

exports.getAllUserPayments = async (req, res, next) => {
  try {
    if(req.user.userType !== "employee" && req.user.userType !== "admin"){
      return res.status(403).json({ message: 'Access Forbidden' })}
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;
    const offset = (page - 1) * limit;
    const userId = req.params.userId;
    // console.log(userId)
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const payments = await Payment.findAll({ where: { customer_id:user.user_id   },
      include: [{
      model: Plot,
      as: 'plot',
      attributes: ['plot_number'] 
    }],
      
      limit,
      offset });
    return res.status(200).json(payments); 
  } catch (error) {
    next(error);
  }
};

exports.getPlotPaymentHistory = async (req, res) => {
  try {
    const { plot_id } = req.params;

    const plotPaymentHistory = await Payment.findAll({
      where: {
        plot_id: plot_id,
      },
      attributes: ['payment_id', 'amount','createdAt'],
      include: [
        {
          model: Plot,
          attributes: ['plot_id', 'plot_number'], // Include any other plot attributes you need
        },
      ],
    });

    res.status(200).json(plotPaymentHistory);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Unable to fetch plot payment history.' });
  }
};


