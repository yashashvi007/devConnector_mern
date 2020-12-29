const express = require('express')
const router = express.Router();
const gravatar = require('gravatar')
const bcrypt  = require('bcryptjs')
const {check , validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const normalize = require('normalize-url')

const User = require('./../../models/userModel');



// signUp 

router.post('/' , [
    check('name' , 'Name is required').not().isEmpty(),
    check('email' , 'Please include a valid email').isEmail(),
    check('password' , 'Please enter a password with 6 or more characters' ).isLength({min : 6})
] ,async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ error : errors.array() })
    }

    const {name , email , password} = req.body;

    try {
        let user = await User.findOne({email});
        if(user){
           return  res.status(400).json({error : [{msg : 'User already exist'}]})
        }
        
        const avatar = normalize(
            gravatar.url(email, {
              s: '200',
              r: 'pg',
              d: 'mm'
            }),
            { forceHttps: true }
          );

        user = new User({
            name , 
            email , 
            avatar,
            password

        })

        const salt =await bcrypt.genSalt(10);

        user.password =await bcrypt.hash(password , salt)

        await user.save();

        const payload = {
            user : {
                id: user.id
            }
        }

        const token = await jwt.sign(payload , process.env.JWT_SECRET , {expiresIn : process.env.EXP} );
        return res.json({token})
       

    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error')
    }

} )






module.exports = router