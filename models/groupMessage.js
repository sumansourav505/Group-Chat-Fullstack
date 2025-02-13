const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");
const Group = require("./group");

const GroupMessage = sequelize.define("GroupMessage", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    message: {  // Renamed from 'text' to 'message' for consistency with controllers
        type: DataTypes.TEXT,
        allowNull: false,
    },
    userId: {  // Renamed from 'memberId' for consistency
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

module.exports = GroupMessage;
