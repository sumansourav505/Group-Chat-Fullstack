const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("../models/user");
const Group = require("../models/group");

const GroupMember = sequelize.define("GroupMember", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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

module.exports = GroupMember;
