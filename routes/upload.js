const express=require('express');
const router=express();
const {uploadFile,uploadMiddleware}=require('../controllers/upload');

router.post('/upload',uploadMiddleware,uploadFile);

module.exports=router;