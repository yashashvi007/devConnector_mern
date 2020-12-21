const express = require('express')

const dotenv = require('dotenv')
const app = express();

dotenv.config({path : './config/config.env'})


const connectDb = require('./config/db')


// requiring routes
const user = require('./api/routes/user')
const auth = require('./api/routes/auth')
const profile = require('./api/routes/profile')
const post = require('./api/routes/posts')

//connecting to database 
connectDb();

//body-parser
app.use(express.json({ extended: false }));

app.use('/api/users' , user );
app.use('/api/auth' , auth)
app.use('/api/profile' , profile)
app.use('/api/post' , post)

const PORT = process.env.PORT || 5000;

app.listen(PORT , ()=> console.log(`server started at port ${PORT}`));
