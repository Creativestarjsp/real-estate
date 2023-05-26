
const {Venture,Phase,Plot} =require("../Models/models")

module.exports={


    All:async(req,res)=>{
        try {
            const phases = await Phase.findAll({
              include: {
                model: Venture,
                attributes: ['venture_id', 'name']
              },
            });
            res.status(200).json({ success: true, data: phases });
          } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server Error' });
          }
    },
    
    Venture_id:async(req,res)=>{
      try {
        const {venture_id}=req.body
          const phases = await Phase.findAll({
            where:{venture_id:venture_id},
            attributes: ['phase_id', 'name']
          });
          res.status(200).json({ success: true, data: phases });
        } catch (err) {
          console.error(err);
          res.status(500).json({ success: false, message: 'Server Error' });
        }
  },

    create:async(req,res)=>{
        try {
          if(req.user.userType !== "employee" && req.user.userType !== "admin"){
            return res.status(403).json({ message: 'Access Forbidden' })}

            const { name, venture_id } = req.body;
        
            // Validate inputs
            if (!name) {
              return res.status(400).send({ message: "Name is required." });
            }
        
            if (!venture_id) {
              return res.status(400).send({ message: "Venture ID is required." });
            }

             // Check if venture exists
            const venture = await Venture.findOne({ where: { venture_id: req.body.venture_id } });
            if (venture) {
                const phase = await Phase.create({ name, venture_id });
                return res.status(201).send(phase);
              
             }else{
                return res.status(404).json({ message: 'Venture not found' });
             }
            
          
          } catch (err) {
            console.log(err);
            return res.status(500).send({ message: "Could not create phase." });
          }
        
    },


 getPhasesByVentureId : async (req, res) => {
  const ventureId = req.params.ventureId;

  try {
    const phases = await Phase.findAll({
      where: { venture_id: ventureId },
      attributes: ['phase_id', 'phase_name']
    });

    return res.status(200).json({ phases });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
},
getPlotsByVentureAndPhase : async (req, res) => {
  const { venture_id, phase_id, page, per_page } = req.query;
  const Page =page || 1
  const per_Page= per_page || 10
  console.log(venture_id,phase_id,page,per_page)
  const limit = parseInt(per_Page);
  const offset = (parseInt(Page) - 1) * limit;
  try {
    const plots = await Plot.findAndCountAll({
      where: { venture_id, phase_id },
      limit,
      offset,
    });
    return res.status(200).json({ plots });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
},
getPhasePlots : async (req, res) => {
  try {
    const { venture_id, phase_id, page, per_page } = req.query;
    const Page =page || 1
    const per_Page= per_page || 10
  
    
    const offset = (Page - 1) * per_Page;
    
    const phase = await Phase.findOne({
      where: { venture_id: venture_id, phase_id: phase_id }
    });
    if (!phase) {
      return res.status(404).json({ message: "Phase not found" });
    }

    const plots = await Plot.findAndCountAll({
      where: { venture_id: venture_id, phase_id: phase_id },
      attributes: ["plot_id", "plot_number"],
      offset: offset,
      limit: per_Page
    });

    const totalPages = Math.ceil(plots.count / per_Page);

    return res.status(200).json({
      plots: plots.rows,
      currentPage: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
},
update: async (req, res) => {
  try {
    if (req.user.userType !== "employee" && req.user.userType !== "admin") {
      return res.status(403).json({ message: 'Access Forbidden' });
    }

    const { name, venture_id } = req.body;
    const { phase_id } = req.params;

    // Validate inputs
    if (!name) {
      return res.status(400).send({ message: "Name is required." });
    }

    if (!venture_id) {
      return res.status(400).send({ message: "Venture ID is required." });
    }

    // Check if phase exists
    const phase = await Phase.findByPk(phase_id);
    if (!phase) {
      return res.status(404).json({ message: 'Phase not found' });
    }

    // Check if venture exists
    const venture = await Venture.findByPk(venture_id);
    if (!venture) {
      return res.status(404).json({ message: 'Venture not found' });
    }

    phase.name = name;
    phase.venture_id = venture_id;
    await phase.save();

    return res.status(200).send(phase);

  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Could not update phase." });
  }
},






 
}