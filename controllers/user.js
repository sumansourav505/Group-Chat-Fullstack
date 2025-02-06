const bcrypt=require('bcrypt');
const User=require('../models/user');
const jwt=require('jsonwebtoken');

const saltRound=10;
const jwtSecrete="secrete";

exports.generateAccessToken=(id,name)=>{
    return jwt.sign(
        {
            userId:id,name:name},
            jwtSecrete,
            {expiresIn:'7d'}
    );
};

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
exports.login=async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({message:'Email and passwords are required.'});
    }
    try{
        const user=await User.findOne({where:{email}});
        if(!user){
            return res.status(400).json({message:'User not found.'});
        }
        const isMatched=await bcrypt.compare(password,user.password);
        if(isMatched){
            const token=exports.generateAccessToken(user.id,user.name);

            res.status(200).json({
                message:'Login successful',
                token,
                userId:user.id,
                name:user.name
            });
        }else{
            res.status(401).json({message:'Incorrect password.'});
        }
    }catch(error){
        console.error('Error during login:',error);
        res.status(500).json({message:'An error occured during login'});
    }
};
