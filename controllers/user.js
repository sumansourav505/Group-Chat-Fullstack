exports.signup=async(req,res)=>{
    const {name,email,phone,password}=req.body;
    if(!name || !email || !phone || !password){
        return res.status(400).json({message:'All fields are required'});
    }
    // res.redirect('/');
    res.status(201).json({message:'signup successfull'});
};
