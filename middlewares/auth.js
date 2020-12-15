const jwt = require('jsonwebtoken')

module.exports = (req, res , next)=>{
    //get token from header 
    const token = req.header('x-auth-token')

    //check if token 
    if(!token){
        return res.status(401).json({msg : 'No token , authorization denied'})
    }

    //verify token 
    try {
        const decoded = jwt.decode(token , process.env.JWT_SECRET)
        req.user = decoded.user

        next();
    } catch (err) {
        res.status(401).json({msg : 'token not valid'})
    }
}