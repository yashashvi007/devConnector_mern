const { response } = require('express');
const express = require('express');
const { check , validationResult } = require('express-validator');
const axios = require('axios')
const request = require('request')
const router = express.Router();
const auth = require('./../../middlewares/auth')
const Profile = require('./../../models/profileModel')
const User = require('./../../models/userModel')


// Get current users profile 
// private
// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
router.get('/me' , auth ,async (req, res)=>{
    try {
        const profile = await Profile.findOne({user : req.user.id}).populate('user' , ['name' , 'avatar'] )

        if(!profile){
            return res.status(400).json({msg : 'There is no prfile for this user'})
        }

        res.json(profile)
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

          res.json(profile)
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
       res.status(500).json({msg : 'internla server error'})
   }
} )


//get profile by user:id 
router.get('/user/:user_id' ,async (req, res)=>{
    try {
        const profile = await Profile.findOne({user : req.params.user_id}).populate('user' , ['name' , 'avatar' ])
        if(!profile) return res.status(400).json({msg : 'Profile not found'})
        res.json(profile)
    } catch (err) {
        if(err.name === 'CastError'){
            return res.status(400).json({msg : 'Profile not found'})
        }
        res.status(500).json({msg : 'internla server error'})
    }
} )


// delete user & profile
router.delete('/' , auth , async (req , res)=>{
    try {
        // remove profile
        await Profile.findOneAndRemove({user : req.user.id})

        // remove user
        await User.findOneAndRemove({_id : req.user.id})

        res.json({msg : 'User removed'});
    } catch (err) {
        res.status(500).json({msg : 'internla server error'})
    }
} )


// put  add profile experience
router.put('/experience' ,[auth , [
    check('title' , 'title is required').not().isEmpty(),
    check('company' , 'company is required').not().isEmpty(),
    check('from' , 'from is required').not().isEmpty()
]] , async (req, res)=>{
    const errors = validationResult(req);
    if(!errors){
        return res.status(400).json({errors : errors.array()})
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      } = req.body;

      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      };

      try {
          const profile = await Profile.findOne({user : req.user.id});

          profile.experience.unshift(newExp);

          await profile.save();

          res.json(profile)
      } catch (err) {
        res.status(500).json({msg : 'internla server error'})
      }
})


// deleting profile experience
router.delete('/experience/:exp_id' ,auth ,async ( req, res )=>{
    

    try {
        const profile = await Profile.findOne({user : req.user.id});

    const removeIndex =  profile.experience.map(item => item.id).indexOf(req.params.exp_id);//indexOf return index of the matched id


    profile.experience.splice(removeIndex , 1 );// splice removes the elemet at index given and goes on ahead deleting  number of times specified

    await profile.save();

    res.json(profile)
        
    } catch (err) {
        res.status(500).json({msg : 'internal server error'})
    }


} )

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
    '/education',
    [
      auth,
      [
        check('school', 'School is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('fieldofstudy', 'Field of study is required').not().isEmpty(),
        check('from' , 'from is required').not().isEmpty()
      ]
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      } = req.body;
  
      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      };
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.education.unshift(newEdu);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );


router.delete('/education/:edu_id' ,auth ,async ( req, res )=>{
    

    try {
        const profile = await Profile.findOne({user : req.user.id});

    const removeIndex =  profile.education.map(item => item.id).indexOf(req.params.edu_id);

    profile.education.splice(removeIndex , 1 );

    await profile.save();

    res.json(profile)
        
    } catch (err) {
        res.status(500).json({msg : 'internla server errro'})
    }


} )


// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${
                req.params.username
            }/repos?per_page=5&sort=created:asc&client_id=${process.env.GET_C_ID}&client_secret=${process.env.GET_C_SEC}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' },
        };

        request(options, (error, response, body) => {
            if (error) console.error(error);

            if (response.statusCode !== 200) {
                return res.status(404).json({ msg: 'No Github profile found' });
            }

            res.json(JSON.parse(body));
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router