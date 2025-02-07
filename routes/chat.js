const express = require('express');
const chatController = require('../controllers/chat');
const authenticateController = require('../middleware/auth');
const router = express.Router();

router.post('/send', authenticateController.authenticate, chatController.sendMessage);
router.get('/messages', authenticateController.authenticate, chatController.getMessages); // Fixed function name

module.exports = router;
