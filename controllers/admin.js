// controllers/group.js
const Group = require('../models/group');
const GroupMember = require('../models/groupMember');
const User = require('../models/user');

// Create Group (Assign Creator as Admin)
exports.createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id; // Assuming authenticated user
        const group = await Group.create({ name });
        await GroupMember.create({ groupId: group.id, userId, isAdmin: true });
        res.status(201).json({ message: "Group created", group });
    } catch (error) {
        res.status(500).json({ error: "Error creating group" });
    }
};

// Invite User (Admin Only)
exports.inviteUser = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const isAdmin = await GroupMember.findOne({ where: { groupId, userId: req.user.id, isAdmin: true } });
        if (!isAdmin) return res.status(403).json({ error: "Only admins can invite users" });
        await GroupMember.create({ groupId, userId, isAdmin: false });
        res.json({ message: "User added to group" });
    } catch (error) {
        res.status(500).json({ error: "Error inviting user" });
    }
};

// Promote to Admin
exports.promoteToAdmin = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const isAdmin = await GroupMember.findOne({ where: { groupId, userId: req.user.id, isAdmin: true } });
        if (!isAdmin) return res.status(403).json({ error: "Only admins can promote users" });
        await GroupMember.update({ isAdmin: true }, { where: { groupId, userId } });
        res.json({ message: "User promoted to admin" });
    } catch (error) {
        res.status(500).json({ error: "Error promoting user" });
    }
};

// Remove User
exports.removeUser = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const isAdmin = await GroupMember.findOne({ where: { groupId, userId: req.user.id, isAdmin: true } });
        if (!isAdmin) return res.status(403).json({ error: "Only admins can remove users" });
        await GroupMember.destroy({ where: { groupId, userId } });
        res.json({ message: "User removed from group" });
    } catch (error) {
        res.status(500).json({ error: "Error removing user" });
    }
};
