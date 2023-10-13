const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const { create } = require('../models/user')
const User = require('../models/user');
module.exports={
    signAccessToken: (userId) =>{
        return new Promise((resolve, reject)=>{
            const payload= {}
            const secret = process.env.ACCESS_TOKEN_SECRET;
            const options ={
                expiresIn: "20000s",
                issuer:"armaanshukla06@gmail.com",
                audience: userId
            }
            JWT.sign(payload, secret, options, (err,token)=>{
                if(err){
                    reject(err)
                }
                resolve(token)
            })
        })
       
    }, verifyAccessToken: (req,res,next)=>{
        const err = new Error('not authenticated')
        if(!req.headers['authorization']){ 
            throw err
        }
        const authHeader = req.headers['authorization'];
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1];
        JWT.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,payload)=>{
            if (err){
            if (err.name === 'JsonWebTokenError'){
                return next(createError.Unauthorized())
            } else {
            return next(createError.Unauthorized(err.message))
        }
        
    } 
    req.payload= payload;
        next();
    })
},signRefreshToken: (userId) =>{
    return new Promise((resolve, reject)=>{
        const payload= {}
        const secret = process.env.REFRESH_TOKEN_SECRET;
        const options ={
            expiresIn: "1y",
            issuer:"armaanshukla06@gmail.com",
            audience: userId
        }
        JWT.sign(payload, secret, options, (err,token)=>{
            if(err){
                reject(err)
            }
            resolve(token)
        })
    })
},verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, payload) => {
        if (err) {
          const error = new Error('Unauthorized');
          return reject(error);
        }
  
        const userId = payload.aud;
  
        try {
          const user = await User.findById(userId);
          if (!user || user.revokedRefreshTokens.includes(refreshToken)) {
            const error = new Error('Unauthorized');
            return reject(error);
          }
  
          resolve({ userId });
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  
}
