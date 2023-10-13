const express= require('express');
const User = require('../models/user');
const authRoute = express.Router()
const {authSchema} = require('../helpers/validationSchema')
const {signAccessToken, signRefreshToken, verifyRefreshToken} = require('../helpers/jwt_helper');
// const { sign } = require('jsonwebtoken');
authRoute.post('/register', async(req, res,next)=>{
try {  
    // const{email , password} = req.body;

    const result = await authSchema.validateAsync(req.body)
    
//     if(!email|| !password){
//         throw createError.BadRequest()
// }
// res.send(req.body)
// console.log(result) 
    const doesExist = await User.findOne({email: result.email})
    if(doesExist){ throw createError.Conflict("User already exist")}

    
    const user = new User(result)

    const savedUser= await user.save()

    const accessToken = await signAccessToken(savedUser.id)
    const refreshToken = await signRefreshToken(savedUser.id)
        res.send({accessToken, refreshToken})
    
} catch (error) {
    if(error.isJoi=== true){
        error.status = 422;
    }
    next(error)
}

})

authRoute.post('/login', async (req,res,next)=>{
   try {
    const result = await authSchema.validateAsync(req.body)
    const user = await User.findOne({email : result.email})

    if(!user){
        const new_error = new Error('email doesnt exist')
        throw new_error;
    }

    const isMatch = await user.isValidPassword(result.password)
    if(!isMatch) {
        const err = new Error('Username, pass dont match')
        throw err
    }

    const accessToken = await signAccessToken(user.id)
    const refreshToken = await signRefreshToken(user.id)
    res.send({accessToken, refreshToken})
   } catch (error) {
    if(error.isJoi === true){
        error.status = 421
    }
    next(error)
   }
})

authRoute.post('/refresh-token', async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        const err = new Error('Bad Request: refreshToken is missing');
        err.status = 400;
        return next(err);
      }
      const { userId } = await verifyRefreshToken(refreshToken);
  
      const accessToken = await signAccessToken(userId);
      const refToken = await signRefreshToken(userId);
      res.send({ accessToken, refToken });
    } catch (error) {
      next(error);
    }
  });

  authRoute.delete('/logout', async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        const err = new Error('Bad Request');
        err.status = 400;
        return next(err);
      }
  
      const { userId } = await verifyRefreshToken(refreshToken);
  
 
      await User.findByIdAndUpdate(userId, { $push: { revokedRefreshTokens: refreshToken } });
  
      res.send('log')
    } catch (error) {
      next(error);
    }
  });
  


module.exports = authRoute;