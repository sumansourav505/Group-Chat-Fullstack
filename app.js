const express=require('express');
const path=require('path');
require('dotenv').config();
const sequelize = require('./config/database');

const userRoutes=require('./routes/user');

const app=express();

//middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));

//serve static page
app.get('/signup',(req,res)=>res.sendFile(path.join(__dirname,'views','signUp.html')));

//routes
app.use('/user',userRoutes);

//server start
sequelize
    .sync({})
    .then(() => {
        console.log('Database synced successfully.');
        app.listen(4000, () => console.log('Server running at http://localhost:4000'));
    })
    .catch((error) => {
        console.error('Error syncing database:', error);
    });
