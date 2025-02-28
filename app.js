
const express = require("express");
const path = require("path");
require("dotenv").config();
const http = require("http"); 
const { Server } = require("socket.io");
const sequelize = require("./config/database");

const User = require("./models/user");
const Group = require("./models/group");
const GroupMember = require("./models/groupMember");
const GroupMessage = require("./models/groupMessage");

const userRoutes = require("./routes/user");
const groupRoutes = require("./routes/group");
const adminRoutes = require("./routes/admin");
const uploadeRoutes=require("./routes/upload");

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
app.io=io;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Serve static pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "views", "login.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "views", "signup.html")));
app.get("/group", (req, res) => res.sendFile(path.join(__dirname, "views", "group.html")));

// Routes
app.use("/user", userRoutes);
app.use("/group", groupRoutes);
app.use("/admin", adminRoutes);
app.use("/api",uploadeRoutes);

//Associations
User.hasMany(Group, { foreignKey: "createdBy", as: "ownedGroups", onDelete: "CASCADE" });
Group.belongsTo(User, { foreignKey: "createdBy", as: "owner" });

//Many-to-Many User and Group
User.belongsToMany(Group, { through: GroupMember, foreignKey: "userId", as: "joinedGroups" });
Group.belongsToMany(User, { through: GroupMember, foreignKey: "groupId", as: "members" });

//Group message associations
User.hasMany(GroupMessage, { foreignKey: "userId", onDelete: "CASCADE" });
GroupMessage.belongsTo(User, { foreignKey: "userId" });

Group.hasMany(GroupMessage, { foreignKey: "groupId", onDelete: "CASCADE" });
GroupMessage.belongsTo(Group, { foreignKey: "groupId" });

//WebSocket Setup
const connectedUsers = {};

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinGroup", ({ userId, groupId }) => {
        socket.join(`group_${groupId}`);
        connectedUsers[userId] = socket.id;
        console.log(`User ${userId} joined group ${groupId}`);
    });

    socket.on("sendMessage", (data) => {
        const { message, groupId, senderId, senderName } = data;

        io.to(`group_${groupId}`).emit("receiveMessage", {
            message,
            groupId,
            senderId,
            senderName,
        });
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        for (const [userId, socketId] of Object.entries(connectedUsers)) {
            if (socketId === socket.id) {
                delete connectedUsers[userId];
                break;
            }
        }
    });
});

//Sync database and start server
sequelize
    .sync()
    .then(() => {
        console.log("Database synced successfully.");
        server.listen(4000, () => console.log("Server running at http://localhost:4000"));
    })
    .catch((error) => {
        console.error("Error syncing database:", error);
    });
     module.exports = { app, io };
