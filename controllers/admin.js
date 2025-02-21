// controllers/group.js
const Group = require('../models/group');
const GroupMember = require('../models/groupMember');

//make admin
exports.makeAdmin = async (req, res) => {
    const { groupId, userId } = req.body;

    try {
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        // Update the createdBy column to the new admin (memberId)
        await Group.update({ createdBy: userId }, { where: { id: groupId } });

        res.json({ message: "Member is now an admin!" });
    } catch (error) {
        console.error("Error making admin:", error);
        res.status(500).json({ error: "Failed to make admin" });
    }
};
//remove member
exports.removeMember = async (req, res) => {
    const { groupId, userId } = req.body;

    try {
        const groupMember = await GroupMember.findOne({ where: { groupId, userId} });
        if (!groupMember) {
            return res.status(404).json({ error: "Member not found in group" });
        }

        // Remove member from the group
        await GroupMember.destroy({ where: { groupId, userId } });

        res.json({ message: "Member removed from group!" });
    } catch (error) {
        console.error("Error removing member:", error);
        res.status(500).json({ error: "Failed to remove member" });
    }
};
