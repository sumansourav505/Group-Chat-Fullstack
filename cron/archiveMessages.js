const cron = require("node-cron");
const { Op } = require("sequelize");
const GroupMessage = require("../models/groupMessage");
const ArchivedGroupMessage = require("../models/achirvedGroupMessage");
const sequelize = require("../config/database");

async function archiveOldMessages() {
    console.log("Running cron job: Archiving old messages...");

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    try {
        // Step 1: Fetch messages older than 1 day
        const oldMessages = await GroupMessage.findAll({
            where: { createdAt: { [Op.lt]: oneDayAgo } },
        });

        if (oldMessages.length === 0) {
            console.log("No old messages to archive.");
            return;
        }

        // Step 2: Move messages to ArchivedGroupMessage
        await sequelize.transaction(async (t) => {
            await ArchivedGroupMessage.bulkCreate(oldMessages.map(msg => ({
                id: msg.id,
                message: msg.message,
                userId: msg.userId,
                groupId: msg.groupId,
                createdAt: msg.createdAt
            })), { transaction: t });

            // Step 3: Delete old messages from GroupMessage
            await GroupMessage.destroy({
                where: { id: oldMessages.map(msg => msg.id) },
                transaction: t
            });
        });

        console.log(`Archived ${oldMessages.length} messages successfully.`);
    } catch (error) {
        console.error("Error archiving messages:", error);
    }
}

// Schedule the cron job to run every night at 12:00 AM
cron.schedule("0 0 * * *", archiveOldMessages);

module.exports = archiveOldMessages;
