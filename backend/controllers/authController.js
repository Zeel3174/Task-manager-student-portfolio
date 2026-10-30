const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
async function register(req,res,next){try{
  const {email,password}=req.body;
  if(!email||!password) return res.status(400).json({message:'email and password are required'});
  const exists=await User.findOne({email}); if(exists) return res.status(409).json({message:'User already exists'});
  const hashed=await bcrypt.hash(password,10); const user=await User.create({email,password:hashed});
  res.status(201).json({message:'Registered successfully',user:{id:user._id,email:user.email}});
}catch(e){next(e)}}
async function login(req,res,next){try{
  const {email,password}=req.body; const user=await User.findOne({email});
  if(!user||!(await bcrypt.compare(password,user.password))) return res.status(401).json({message:'Invalid credentials'});
  const token=jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET,{expiresIn:'1h'});
  res.json({token,user:{id:user._id,email:user.email}});
}catch(e){next(e)}}
async function me(req,res,next){try{const user=await User.findById(req.user.id).select('-password');res.json(user)}catch(e){next(e)}}
module.exports={register,login,me};
