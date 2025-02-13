const Group = require("../models/group");
const GroupMember = require("../models/groupMember");
const GroupMessage = require("../models/groupMessage");
const User = require("../models/user");
const { Op } = require("sequelize");

// Create a new group
exports.createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const createdBy = req.user.id;
        
        if (!createdBy) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Create group
        const group = await Group.create({ name, createdBy });

        // Automatically add creator to the group
        await GroupMember.create({ userId: createdBy, groupId: group.id });

        res.status(201).json({ message: "Group created successfully", group });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ error: "Failed to create group" });
    }
};

// Send message in a specific group
exports.sendMessage = async (req, res) => {
    try {
        const { message, groupId } = req.body;
        const userId = req.user.id; // Ensure user is extracted from the authenticated request

        if (!message || !groupId) {
            return res.status(400).json({ error: "Message and groupId are required." });
        }

        const newMessage = await GroupMessage.create({
            message,
            groupId,
            userId
        });

        // Fetch the sender's name for the response
        const sender = await User.findByPk(userId, { attributes: ["id", "name"] });

        res.status(201).json({
            chatMessage: {
                id: newMessage.id,
                message: newMessage.message,
                senderName: sender ? sender.name : "Unknown"
            }
        });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message." });
    }
};

// Get all messages for a specific group (only for group members)
exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        const messages = await GroupMessage.findAll({
            where: { groupId },
            include: [
                {
                    model: User,
                    attributes: ["name"], // Fetch user name
                },
            ],
        });

        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            message: msg.message,
            senderName: msg.User ? msg.User.name : "Unknown", // Ensure senderName is not undefined
        }));

        res.status(200).json(formattedMessages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to load messages" });
    }

};

// Get all groups the user created or joined
exports.getUserGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Fetch groups the user is a member of
        const user = await User.findByPk(userId, {
            include: [{
                model: Group,
                as: "joinedGroups",
                through: { attributes: [] } // Exclude join table attributes
            }]
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch groups the user created
        const createdGroups = await Group.findAll({ where: { createdBy: userId } });

        // Merge both lists while avoiding duplicates
        const allGroups = [...new Map([...createdGroups, ...user.joinedGroups].map(g => [g.id, g])).values()];

        res.status(200).json(allGroups);
    } catch (error) {
        console.error("Error fetching user groups:", error);
        res.status(500).json({ error: "Failed to fetch groups" });
    }
};

// Invite a user to a group
exports.inviteUserToGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        if (!groupId || !userId) {
            return res.status(400).json({ error: "Group ID and User ID are required" });
        }

        // Check if the group exists
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        // Check if the user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the user is already in the group
        const existingMember = await GroupMember.findOne({ where: { groupId, userId } });
        if (existingMember) {
            return res.status(400).json({ error: "User is already a member of this group" });
        }

        // Add user to the group
        await GroupMember.create({ groupId, userId });

        res.status(201).json({ message: "User invited successfully" });
    } catch (error) {
        console.error("Error inviting user:", error);
        res.status(500).json({ error: "Failed to invite user" });
    }
};
