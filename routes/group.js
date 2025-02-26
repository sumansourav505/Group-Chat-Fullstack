
const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group");
const authenticateController = require("../middleware/auth");


router.post("/create", authenticateController.authenticate, groupController.createGroup);
router.get("/user-groups", authenticateController.authenticate, groupController.getUserGroups);
router.post("/invite", authenticateController.authenticate, groupController.inviteUserToGroup);
router.post("/send-message", authenticateController.authenticate,groupController.sendMessage);
router.get("/messages/:groupId", authenticateController.authenticate, groupController.getGroupMessages);
router.get("/info/:groupId", authenticateController.authenticate, groupController.getGroupInfo);
router.get("/search-users", authenticateController.authenticate, groupController.searchUsers);

module.exports = router;
