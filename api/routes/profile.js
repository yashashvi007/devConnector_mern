const express = require('express');
const { check , validationResult } = require('express-validator');

const router = express.Router();
const auth = require('./../../middlewares/auth')
const Profile = require('./../../models/profileModel')
const User = require('./../../models/userModel')


// Get current users profile 
// private
router.get('/me' , auth ,async (req, res)=>{
    try {
        const profile = await Profile.findOne({user : req.user.id}).populate('user' , ['name' , 'avatar'] )

        if(!profile){
            return res.status(400).json({msg : 'There is no prfile for this user'})
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send('server error')
    }
} )

// Create logged in user profile  and update it
router.post('/' , [auth , [
    check('status' , 'Status is required' ).not().isEmpty(),
    check('skills' , 'skills is required' ).not().isEmpty()
]] ,async (req ,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }

    const {
        website,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
        company,
        bio,
        status,
        githubusername,
        location
       
      } = req.body;

      //Build profile object
      const profileFieds = {}
      profileFieds.user = req.user.id
      if(company) profileFieds.company = company
      if(website) profileFieds.website = website
      if(location) profileFieds.location = location
      if(bio) profileFieds.bio = bio
      if(status) profileFieds.status = status
      if(githubusername) profileFieds.githubusername = githubusername

      if(skills){
          profileFieds.skills = skills.split(',').map(skill => skill.trim())
      }

      //Build social object
      profileFieds.social = {}
      
      if(youtube) profileFieds.social.youtube = youtube
      if(twitter) profileFieds.social.twitter = twitter
      if(linkedin) profileFieds.social.linkedin = linkedin
      if(facebook) profileFieds.social.facebook = facebook
      if(instagram) profileFieds.social.instagram = instagram

      try {
          let profile = await Profile.findOne({user : req.user.id})

          if(profile) {
              // Update
              profile = await Profile.findOneAndUpdate({user : req.user.id} ,{$set : profileFieds} , {new : true} )
              return res.json(profile);
          }

          // create
          profile = new Profile(profileFieds)
          await profile.save()

          res.json({profile})
      } catch (err) {
        res.status(500).json({msg : 'internla server errro'})
      }

      console.log(profileFieds.skills);

} )

// get all profiles
router.get('/' ,async (req, res)=>{
   try {
       const profiles = await Profile.find().populate('user' , ['name' , 'avatar' ] )
       res.json({profiles})
   } catch (err) {
       res.status(500).json({msg : 'internla server errro'})
   }
} )


//get profile by user:id 
router.get('/user/:user_id' ,async (req, res)=>{
    try {
        const profile = await Profile.findOne({user : req.params.user_id}).populate('user' , ['name' , 'avatar' ])
        if(!profile) return res.status(400).json({msg : 'Profile not found'})
        res.json({profile})
    } catch (err) {
        if(err.name == 'CastError'){
            return res.status(400).json({msg : 'Profile not found'})
        }
        res.status(500).json({msg : 'internla server errro'})
    }
} )


module.exports = router