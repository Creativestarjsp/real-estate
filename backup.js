

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
        return res.status(400).json({ success: false, message: "Commission percentage not found for the given designation and venture1" });
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
        console.log(referralEmployee,"find refferal");
  
        const referralDesignation = await Percentage.findOne({
          where: { desig_id: referralEmployee.desig_id, venture_id: venture.venture_id },
        });
        console.log(referralDesignation,"ppppp")
        if (!referralDesignation) {
          await t.rollback();
          return res.status(400).json({ success: false, message: "Commission percentage not found for the given designation and venture2" });
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
  }