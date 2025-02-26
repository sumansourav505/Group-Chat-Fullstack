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
        const userId = req.user.id; // Ensure user is extracted from the authenticated requests

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

        const chatMessage = {
            id: newMessage.id,
            message: newMessage.message,
            senderId: sender.id,
            senderName: sender.name
        };
        //emit by web socket
        req.app.io.to(`group_${groupId}`).emit("newMessage", chatMessage);

        res.status(201).json({chatMessage});
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
            attributes:["id","message","userId"],
            include: [
                {
                    model: User,
                    attributes: ["id","name"], // Fetch userId and  name
                },
            ],

        });
        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            message: msg.message,
            senderId:msg.userId,
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
        const userId = req.user.id;exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        const messages = await GroupMessage.findAll({
            where: { groupId,userId},
            attributes:["id","message","userId"],
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
            senderId:msg.userId,
            senderName: msg.User ? msg.User.name : "Unknown", // Ensure senderName is not undefined
        }));

        res.status(200).json(formattedMessages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to load messages" });
    }

};
        
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
// Get all members of a specific group
// exports.getGroupInfo = async (req, res) => {
//     try {
//         const { groupId } = req.params;

//         console.log("Fetching group info for groupId:", groupId);

//         if (!groupId) {
//             return res.status(400).json({ error: "Group ID is required" });
//         }

//         const group = await Group.findByPk(groupId, {
//             include: [
//                 {
//                     model: User,
//                     as: "members",
//                     attributes: ["id", "name"],
//                     through: { attributes: [] },
//                 },
//             ],
//         });

//         if (!group) {
//             console.log(`Group with ID ${groupId} not found.`);
//             return res.status(404).json({ error: "Group not found" });
//         }

//         res.status(200).json({
//             id: group.id,
//             name: group.name,
//             createdBy: group.createdBy,
//             members: group.members, 
//         });
//     } catch (error) {
//         console.error("Error fetching group info:", error);
//         res.status(500).json({ error: "Failed to load group info" });
//     }
// };
//
exports.getGroupInfo = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findByPk(groupId, {
            attribute:["id","name","createdBy"],
            include: [
                {
                    model: User,
                    as: "members", // Use the alias defined in associations
                    attributes: ["id", "name"],
                    through: { attributes: [] },
                },
            ],
        });

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        // Mark admin in the members list
        const membersWithAdminTag = group.members.map(user => ({
            id: user.id,
            name: user.name,
            isAdmin: user.id === group.createdBy,
        }));

        res.status(200).json({
            id: group.id,
            name: group.name,
            createdBy:group.createdBy,
            members: membersWithAdminTag,
        });
    } catch (error) {
        console.error("Error fetching group info:", error);
        res.status(500).json({ error: "Failed to load group info" });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Search query is required" });
        }

        // Perform case-insensitive search for users
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${query}%` } },
                    { email: { [Op.iLike]: `%${query}%` } },
                    { phoneNumber: { [Op.iLike]: `%${query}%` } }
                ]
            }
        });

        res.status(200).json(users);
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ error: "Server error" });
    }
};

