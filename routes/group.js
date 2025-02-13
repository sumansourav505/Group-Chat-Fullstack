const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group");
const authenticateController = require("../middleware/auth");

// Group creation
router.post("/create", authenticateController.authenticate, groupController.createGroup);

// Get all groups of a user
router.get("/user-groups", authenticateController.authenticate, groupController.getUserGroups);

// Invite a user to a group
router.post("/invite", authenticateController.authenticate, groupController.inviteUserToGroup);

// Send message in a group
router.post("/send-message", authenticateController.authenticate, groupController.sendMessage);
router.get('/messages/:groupId', authenticateController.authenticate, groupController.getGroupMessages);

module.exports = router;
