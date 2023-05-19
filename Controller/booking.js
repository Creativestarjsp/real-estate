const { Op } = require("sequelize");
const sequelize  = require("../Config/db");
const {Employee,User,Designation,PlotBooking,Plot,Commission,Payment,Phase,Venture,Percentage} = require('../Models/models')
module.exports={


// GET /employee/bookings

Get_All: async (req, res) => {
  try {
    if(req.user.userType !== "employee" && req.user.userType !== "admin") {
      return res.status(403).json({ message: 'Access Forbidden' })
    }
    const { page, limit } = req.body;
    console.log(page,limit)
    const Page = page || 1;
    const Limit = limit || 10;
    const offset = (Page - 1) * Limit;

    const id = req.user.aud[0]; // assuming user id is stored in req.user

    const bookings = await PlotBooking.findAll({
      where: {
        [Op.or]: [{ customer_id: id }, { agent_id: id }]
      },
      include: [
        { model: Plot, include: [{ model: Phase, attributes: ["name"] }], attributes: ["plot_number"] },
        { model: User, attributes: ["name"] },
        { model: Employee, attributes: ["name"] }
      ],
      attributes: ["booking_id", "createdAt", "status"],
      Limit,
      offset
    });

    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
},

  

  Create: async (req, res) => {
    try {
      if (req.user.userType !== "employee" && req.user.userType !== "admin") {
        return res.status(403).json({ message: 'Access Forbidden' });
      }
  
      const t = await sequelize.transaction({ isolationLevel: 'SERIALIZABLE' });
      const { plot_id, customer_id, agent_id, amount, payment_method, offer_sqr_yard_price } = req.body;
      const updateObj = {};
  
      // Check if the plot is available for booking
      const plot = await Plot.findByPk(plot_id);
      if (!plot) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Plot not found" });
      }
  
      if (!plot.offer_sqr_yard_price) {
        if (offer_sqr_yard_price) {
          updateObj.offer_sqr_yard_price = offer_sqr_yard_price;
          updateObj.offer_price = offer_sqr_yard_price * plot.square_yards;
  
          const [rowsUpdated] = await Plot.update(updateObj, {
            where: { plot_id: plot_id },
            transaction: t
          });
  
          if (rowsUpdated === 0) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Something Went Wrong..." });
          }
        } else {
          return res.status(400).json({ success: false, message: "Final Price not Defined" });
        }
      }
  
      if (plot.status !== "available") {
        await t.rollback();
        return res.status(400).json({ success: false, message: "The selected plot is already booked" });
      }
  
      const venture = await Venture.findByPk(plot.venture_id);
  
      if (venture.status !== "active") {
        return res.status(400).json({ success: false, message: "Venture is inactive" });
      }
  
      // Check phase status
      const phase = await Phase.findByPk(plot.phase_id);
      if (phase.status !== "active") {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Phase is inactive" });
      }
  
      const employee = await Employee.findByPk(agent_id);
      if (!employee) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Employee not found" });
      }
  
      if (!employee.desig_id) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Designation not found" });
      }
  
      const designation = await Percentage.findOne({
        where: { desig_id: employee.desig_id, venture_id: venture.venture_id },
      });
  
      if (!designation) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Commission percentage not found for the given designation and venture" });
      }
  
      const commissionPercentage = designation.percentage;
      const referralId = employee.referralId;
      const commissionAmount = (amount * commissionPercentage) / 100;
  
      const booking = await PlotBooking.create(
        { plot_id, customer_id, agent_id },
        { transaction: t }
      );
  
      const commission = await Commission.create(
        { amount: commissionAmount, employeeId: agent_id, plotBookingId: booking.booking_id, plot_id: plot_id },
        { transaction: t }
      );
  
      const payment = await Payment.create(
        { amount: amount, booking_id: booking.booking_id, payment_method: payment_method, customer_id: customer_id, plot_id: plot_id, venture_id: venture.venture_id },
        { transaction: t }
      );
  
      await Plot.update(
        { status: "hold", customer_id: customer_id, agent_id: agent_id },
        { where: { plot_id }, transaction: t }
      );
  
      let referral = referralId;
      console.log(referralId);
  
      while (referral) {
        const referralEmployee = await Employee.findByPk(referral);
        if (!referralEmployee) {
          break;
        }
  
        const referralDesignation = await Percentage.findOne({
          where: { desig_id: referralEmployee.desig_id, venture_id: venture.venture_id },
        });
  
        if (!referralDesignation) {
          await t.rollback();
          return res.status(400).json({ success: false, message: "Commission percentage not found for the given designation and venture" });
        }
  
        const rcommissionPercentage = referralDesignation.percentage;
        const referralCommissionAmount = (amount * rcommissionPercentage) / 100;
  
        const referralCommission = await Commission.create(
          { amount: referralCommissionAmount, employeeId: referral, plotBookingId: booking.booking_id, plot_id: plot_id },
          { transaction: t }
        );
  
        referral = referralEmployee.referralId;
      }
  
      await t.commit();
  
      res.status(201).json({ success: true, data: booking });
    } catch (err) {
      console.error(err);
      await t.rollback();
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },
  
  //update 
  //delete 
  //
   getBookingPaymentDetails : async (req, res) => {
    try {
      const booking_id = req.params.id;
      console.log(booking_id)
  
      // find the booking details
      const booking = await PlotBooking.findByPk(booking_id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
  
      // find the plot details
      const plot = await Plot.findByPk(booking.plot_id);
      if (!plot) {
        return res.status(404).json({ success: false, message: 'Plot not found' });
      }
  
      // find the payment details for the booking
      const payments = await Payment.findAll({
        where: { booking_id },
        attributes: [[sequelize.fn('sum', sequelize.col('amount')), 'total_paid_amount']],
        raw: true,
      });
  // console.log(payments,plot.offer_price )
      // calculate the remaining amount
      const totalPaidAmount = payments[0].total_paid_amount || 0;
      const remainingAmount = plot.offer_price - totalPaidAmount;
  
      res.status(200).json({ success: true, data: { total_paid_amount: totalPaidAmount, remaining_amount: remainingAmount } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },
  //pending
 addPayment: async (req, res) => {
    const t = await sequelize.transaction({ isolationLevel: 'SERIALIZABLE' });
  
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin"){
        return res.status(403).json({ message: 'Access Forbidden' })}

      const { booking_id, amount, payment_method,customer_id  } = req.body;
  
      // check if booking exists
      const booking = await PlotBooking.findByPk(booking_id, {
        include: [{
          model: Plot,
          attributes: ['plot_id', 'offer_price']
        }]
      });
 
      if (!booking) {
        await t.rollback();
        return res
          .status(400)
          .json({ success: false, message: "Booking not found" });
      }
      // check if plot exists
      const plot = await Plot.findByPk(booking.plot_id);
  
      if (!plot) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Plot not found" });
      }
      if(!plot.offer_sqr_yard_price){
        await t.rollback();
        return res.status(400).json({ success: false, message: "Final Price not Defined" });
      }
  
      // check if venture exists
    const venture = await Venture.findByPk(plot.venture_id);
  
    if (!venture) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Venture not found" });
    }
  
      // calculate remaining amount
      const paidAmount = await Payment.sum('amount', {
        where: { booking_id }
      });
      const remainingAmount = booking.plot.offer_price - paidAmount;
  
      if (amount > remainingAmount) {
        await t.rollback();
        return res
          .status(400)
          .json({ success: false, message: "Payment amount is more than remaining amount" });
      }
  
      // create the payment
      const payment = await Payment.create(
        { amount, booking_id, payment_method,customer_id,plot_id:booking.plot_id,venture_id:venture.venture_id   },
        { transaction: t }
      );
 // get the commission percentage for the agent's designation
 const employee = await Employee.findByPk(booking.agent_id);
 const designation = await Percentage.findOne({
  where: { desig_id:employee.desig_id,venture_id:venture.venture_id },
});

if (!designation) {
  await t.rollback();
  return res.status(400).json({ success: false, message: "Commission percentage not found for the given designation and venture 1" });
}
 const commissionPercentage = designation.percentage;
 const referralId = employee.referralId;
//  console.log(booking,"////",employee,referralId)


 // calculate the commission amount
 const commissionAmount = (amount * commissionPercentage) / 100;
 // console.log(plot.offer_price,commissionPercentage,commissionAmount,"main")
 
 // create the commission
 const commission = await Commission.create(
  { amount: commissionAmount,employeeId:employee.emp_id,plotBookingId:booking.booking_id,plot_id:booking.plot_id},
  { transaction: t }
);

      // handle referrals
      let referral = referralId;
      console.log(referralId)
      while (referral) {
      // get the employee associated with the referralId
      const referralEmployee = await Employee.findByPk(referral);
      if (referralEmployee ==null) {
        break;
      // await t.rollback();
      // return res.status(400).json({ success: false, message: "Invalid referral ID" });
      }

  // get the commission percentage for the employee's designation
  
  const referralDesignation = await Percentage.findOne({
    where: { desig_id:referralEmployee.desig_id,venture_id:venture.venture_id },
  });
  
  if (!designation) {
    await t.rollback();
    return res.status(400).json({ success: false, message: "Commission percentage not found for the given designation and venture 1" });
  }
  const rcommissionPercentage = referralDesignation.percentage;

  // calculate the commission amount
  const commissionAmount = (amount * rcommissionPercentage) / 100;

  const commissionEmployeeId = referral;
  console.log(commissionAmount,"next1")
  // create the commission for the employee
  const referralCommission = await Commission.create(
    { amount: commissionAmount, employeeId: commissionEmployeeId, plotBookingId: booking.booking_id,plot_id:booking.plot_id },
    { transaction: t }
  );

  // update the referral ID for the next iteration
  referral = referralEmployee.referralId;
}
  
      await t.commit();
  
      res.status(201).json({ success: true, data: payment });
    } catch (err) {
      console.error(err);
      await t.rollback();
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },
  // add payment through plot_id
  addPayment_plot_id: async (req, res) => {
    const t = await sequelize.transaction({ isolationLevel: 'SERIALIZABLE' });
  
    try {
      if(req.user.userType !== "employee" && req.user.userType !== "admin"){
        return res.status(403).json({ message: 'Access Forbidden' })}
      const { plot_id, amount, payment_method, customer_id } = req.body;
  
      // check if plot exists
      const plot = await Plot.findByPk(plot_id);
  
      if (!plot) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Plot not found" });
      }
      if(!plot.sqr_yard_price){
        await t.rollback();
        return res.status(400).json({ success: false, message: "Final Price not Defined" });
      }
  
      // calculate remaining amount
      const paidAmount = await Payment.sum('amount', { where: { plot_id } });
      const remainingAmount = plot.offer_price - paidAmount;
  
      if (amount > remainingAmount) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Payment amount is more than remaining amount" });
      }
  
      // create the payment
      // create the payment
      const payment = await Payment.create(
        { amount, booking_id, payment_method,customer_id,plot_id:booking.plot_id,venture_id:venture.venture_id   },
        { transaction: t }
      );
      // get the commission percentage for the agent's designation
      const booking = await PlotBooking.findOne({ where: { plot_id } });
      const employee = await Employee.findByPk(booking.agent_id);
          // check if venture exists
    const venture = await Venture.findByPk(plot.venture_id);
  
    if (!venture) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Venture not found" });
    }
      const designation = await Percentage.findOne({
        where: { desig_id:employee.desig_id,venture_id:venture.venture_id },
      });
      
      if (!designation) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Commission percentage not found for the given designation and venture 1" });
      }
      const commissionPercentage = designation.percentage;
      const referralId = employee.referralId;
  
      // calculate the commission amount
      const commissionAmount = (amount * commissionPercentage) / 100;
  
      // create the commission
      const commission = await Commission.create(
        { amount: commissionAmount, employeeId: employee.emp_id, plotBookingId: booking.booking_id, plot_id },
        { transaction: t }
      );
  
      // handle referrals
      let referral = referralId;
  
      while (referral) {
        // get the employee associated with the referralId
        const referralEmployee = await Employee.findByPk(referral);
  
        if (!referralEmployee) {
          break;
        }
  
        // get the commission percentage for the employee's designation
        const referralDesignation = await Percentage.findOne({
          where: { desig_id:referralEmployee.desig_id,venture_id:venture.venture_id },
        });
        
        if (!designation) {
          await t.rollback();
          return res.status(400).json({ success: false, message: "Commission percentage not found for the given designation and venture 1" });
        }
       
        const rcommissionPercentage = referralDesignation.percentage;
  
        // calculate the commission amount
        const commissionAmount = (amount * rcommissionPercentage) / 100;
  
        const commissionEmployeeId = referral;
  
        // create the commission for the employee
        const referralCommission = await Commission.create(
          { amount: commissionAmount, employeeId: commissionEmployeeId, plotBookingId: booking.booking_id, plot_id },
          { transaction: t }
        );
  
        // update the referral ID for the next iteration
        referral = referralEmployee.referralId;
      }
  
      await t.commit();
  
      res.status(201).json({ success: true, data: payment });
    } catch (err) {
      console.error(err);
      await t.rollback();
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
  
  
  

}