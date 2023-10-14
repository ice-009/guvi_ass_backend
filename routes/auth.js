const express = require('express');
const User = require('../models/user');
const authRoute = express.Router();
const { authSchema } = require('../helpers/validationSchema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt_helper');

authRoute.post('/register', async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    const doesExist = await User.findOne({ email: result.email });
    if (doesExist) {
      throw createError.Conflict('User already exists');
    }
    
    const user = new User(result);
    const savedUser = await user.save();

    // Sign an access token for the user
    const accessToken = await signAccessToken(savedUser.id);

    res.json({ user: savedUser, accessToken });
  } catch (error) {
    if (error.isJoi === true) {
      error.status = 422;
    }
    next(error);
  }
});

authRoute.post('/login', async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    const user = await User.findOne({ email: result.email });

    if (!user) {
      throw createError.NotFound('User not found');
    }

    const isMatch = await user.isValidPassword(result.password);
    if (!isMatch) {
      throw createError.Unauthorized('Invalid email or password');
    }

    // Sign an access token for the user
    const accessToken = await signAccessToken(user.id);

    res.json({ user, accessToken });
  } catch (error) {
    if (error.isJoi === true) {
      error.status = 422;
    }
    next(error);
  }
});

authRoute.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw createError.BadRequest('Refresh token is missing');
    }
    const { userId } = await verifyRefreshToken(refreshToken);

    // Sign a new access token for the user
    const accessToken = await signAccessToken(userId);

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
});

authRoute.delete('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw createError.BadRequest('Refresh token is missing');
    }
    const { userId } = await verifyRefreshToken(refreshToken);

    // Handle the logout logic, e.g., revoke the token

    res.send('Logged out');
  } catch (error) {
    next(error);
  }
});

module.exports = authRoute;
