const express = require('express');
const auth = require('../../middlewares/auth');
const router = express.Router();
const User = require('./../../models/userModel')
const {check , validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


// Get authenticated user
// private
router.get('/' ,auth ,async (req, res)=>{
   try {
       const user = await User.findById(req.user.id).select('-password');
       res.json(user);
   } catch (err) {
       res.status(500).send('Server Error');
   }
} )



//authenticate user and get token 
// login
router.post('/' , [
    check('email' , 'Please enter a valid email').isEmail(),
    check('password'  , 'Please provide a password').exists()
] ,async (req, res)=>{
   const errors = validationResult(req);
   if(!errors.isEmpty()){
     return res.status(400).json({errors : errors.array()})
   }

   const {email , password} = req.body

   try {
       let user = await User.findOne({email})
       if(!user){
          return res.status(400).json({errors: [{msg : 'invalid credentials'}]})
       }
       
       const isMatch =await bcrypt.compare(password , user.password)

       if(!isMatch){
           return res.status(400).json({errors: [{msg : 'invalid credentials'}]})
       }

       const payload = {
           user : {
               id : user.id
           }
       }

       jwt.sign(payload , process.env.JWT_SECRET , {expiresIn : process.env.EXP} , (err , token)=>{
           if(err) throw err;
           res.json({token: token})
       } )

   } catch (err) {
       console.log(err.message);
       res.status(500).json({'msg' : 'internal server'})
   }
} )


module.exports = router;