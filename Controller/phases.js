
const {Venture,Phase} =require("../Models/models")

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

 
}