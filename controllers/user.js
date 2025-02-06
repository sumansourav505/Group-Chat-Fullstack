const bcrypt=require('bcrypt');
const User=require('../models/user');

const saltRound=10;

exports.signup=async(req,res)=>{
    const {name,email,phone,password}=req.body;
    if(!name || !email || !phone || !password){
        return res.status(400).json({message:'All fields are required'});
    }
    try{
        const existingUser=await User.findOne({where:{email}});
        if(existingUser){
            return res.status(400).json({message:'User already exist.'});
        }
        const hashedPassword=await bcrypt.hash(password,saltRound);
        const newUser=await User.create({
            name,
            email,
            phone,
            password:hashedPassword,
        });
        res.status(201).json({message:'User signup successfully.',user:newUser});
    }catch(error){
        console.error('Error during signup',error);
        res.status(500).json({message:'An error occoured during signup.'});
    };
    // res.redirect('/');
};
exports.login=async(req,res)=>{};
