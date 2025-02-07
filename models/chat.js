const {DataTypes}=require('sequelize');
const sequelize=require('../config/database');
const { timeStamp } = require('console');

const Chat=sequelize.define('Chat',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    message:{
        type:DataTypes.STRING,
        allowNull:false
    }
})

module.exports=Chat;
