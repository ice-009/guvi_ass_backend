const express = require('express');
const bodyParser = require('body-parser');
const mongoose= require('mongoose');
const cors = require('cors')
const morgan = require('morgan')
const app = express();
app.use(cors());
const authRoute = require('./routes/auth')
const {verifyAccessToken} = require('./helpers/jwt_helper')
require('dotenv').config()
mongoose.connect("mongodb+srv://ice-009:Armaan%4006@cluster0.ynzphiq.mongodb.net/auths",{
    useNewUrlParser: true,
    useUnifiedTopology:true

})

app.use(morgan('dev'))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', verifyAccessToken,(req,res)=>{


  // console.log(req.headers['authorization'])
  res.send('fuckworld')
})

app.use('/auth', authRoute)



app.use(async(req,res,next)=>{
  const error = new Error('Not found')
  error.status=404
  // console.log(error)
  next(error)
  console.log(error)
})

app.use((err,req,res,next)=>{
  res.status(err.status || 500)
  res.send({
    error:{
      message : err.message,
      status: err.status||500
    }
  })
})


const port = 3001;
app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});