const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("../models/user");
const Group = require("../models/group");

const Message = sequelize.define("Message", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Group,
            key: "id",
        },
        onDelete: "CASCADE",
    }
});

module.exports = Message;
