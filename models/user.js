const {DataTypes,Sequelize}=require('sequelize');
const sequelize=require('../config/database');

const User=sequelize.define('User',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phone:{
        type:DataTypes.BIGINT,
        allowNull:false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
});
module.exports=User;