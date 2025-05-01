const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler'); 


const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body; 
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'Owner', 
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role), 
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }


  const user = await User.findOne({ email }).select('+password');


  if (user && (await user.comparePassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role), 
    });
  } else {
    res.status(401); 
    throw new Error('Invalid email or password');
  }
});


const getMe = asyncHandler(async (req, res) => {
  
  if (req.user) {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
    });
  } else {
      res.status(404);
      throw new Error('User not found');
  }
});


module.exports = {
  registerUser,
  loginUser,
  getMe,
};