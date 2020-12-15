const mongoose = require('mongoose')

const connectDb =async ()=>{
    try{
      await mongoose.connect(process.env.MONGO_URL , {useNewUrlParser:true , useUnifiedTopology: true , useFindAndModify: false , useCreateIndex: true });
      console.log('connected to db');
    } catch(err){
      console.log(err.message);
      process.exit(1)
    }
}

module.exports = connectDb;