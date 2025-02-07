const Chat = require('../models/chat');
const User = require('../models/user');

exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id; // Get userId from authentication middleware

        if (!message) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        const chatMessage = await Chat.create({ userId, message });

        res.status(201).json({ chatMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Chat.findAll({
            include: {
                model: User,
                attributes: [ 'name']  // Fetch username instead of just userId
            },
            order: [['createdAt', 'ASC']]
        });

        res.json(messages);
    } catch (error) {
        console.error("Error loading messages:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
