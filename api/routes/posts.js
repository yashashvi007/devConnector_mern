const express = require('express')
const router = express.Router()
const { check , validationResult } = require('express-validator');
const axios = require('axios')
const request = require('request')

const auth = require('./../../middlewares/auth')
const Profile = require('./../../models/profileModel')
const User = require('./../../models/userModel')
const Post = require('./../../models/postModel')


// creating a post
router.post('/' , [auth , [
    check('text' , 'text is required' ).not().isEmpty()
]] ,async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password')

        const newPost =new Post( {
            text : req.body.text,
            name : user.name , 
            avatar : user.avatar , 
            user : req.user.id
        })

        const post = await newPost.save()

        res.json({post});
    } catch (err) {
        console.log(err.message)
        res.status(500).json({msg : 'server error'})
    }
})


// getting all te post
router.get('/' ,auth ,async(req ,res)=>{
  try {
     const posts = await Post.find().sort({date : -1})

     res.json({posts})
  } catch (err) {
    console.log(err.message)
    res.status(500).json({msg : 'server error'})
  }
} )


// get post by id
router.get('/:id' ,auth ,async(req ,res)=>{
    try {
       const post = await Post.findById(req.params.id)
       if(!post){
           return res.status(404).json({msg : 'Post not found'});
       }


       res.json({post})
    } catch (err) {
      console.log(err.message);

      if(err.name === 'CastError'){
          return res.status(404).json({msg : 'post not found'})
      }
      
      res.status(500).json({msg : 'server error'})
    }
  } )


// deleting post 
router.delete('/:id' , auth , async (req , res)=>{
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({msg : 'Post not found'});
        }

        if(post.user.toString() !== req.user.id){
            return res.status(401).json({msg : 'user not authorized'})
        }

        await post.remove();
        res.json({msg : 'Post removed'})
    } catch (err) {
        console.log(err.message);

      if(err.name === 'CastError'){
          return res.status(404).json({msg : 'post not found'})
      }
      
      res.status(500).json({msg : 'server error'})
    }
} )


//liking a post 
router.put('/like/:id' , auth , async(req ,res)=>{
    try {
        const post = await Post.findById(req.params.id);

        if(post.likes.filter(like => like.user.toString() === req.user.id ).length>0){
            return res.status(400).json({msg : 'Post already liked'})
        }
    } catch (err) {
        
    }
} )

module.exports = router