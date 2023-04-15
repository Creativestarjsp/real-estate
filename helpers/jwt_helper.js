const JWT = require('jsonwebtoken')

module.exports = {
    signAccessToken: ({id,data}) => {
    
      return new Promise((resolve, reject) => {
        const payload = {userType:data,user_Id:id}
       
        const secret = process.env.JWT_SECRET
        const options = {
          expiresIn: '1y',
          issuer: 'lookin.in',
          audience: Array.isArray(id) ? id : [id],
        }
        JWT.sign(payload, secret, options, (err, token) => {
          if (err) {
            console.log(err.message)
            
            return
          }
          resolve(token)
        })
      })
    },
    
    // JWT Verify Token 
 verifyToken : (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    JWT.verify(bearerToken, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        res.sendStatus(403);
      } else {
        req.user = data;
        next();
      }
    });
  } else {
    res.sendStatus(403);
  }
}
}