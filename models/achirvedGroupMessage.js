const {DataTypes}=require('sequelize');
const sequelize=require('../config/database');

const ArchivedGroupMessage=sequelize.define("ArchivedGroupMessage",{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
    },
    message:{
        type:DataTypes.TEXT,
        allowNull:false,
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    groupId:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    createdAt:{
        type:DataTypes.DATE,
        allowNull:false,
    }
});

module.exports=ArchivedGroupMessage;