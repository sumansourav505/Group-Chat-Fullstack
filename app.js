const express = require('express');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/database');

const User = require('./models/user');
//const Chat = require('./models/chat');
const Group = require('./models/group');
const GroupMember = require('./models/groupMember');
const GroupMessage=require('./models/groupMessage')

const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/group');
const adminRoutes = require("./routes/admin");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve static pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'views', 'signup.html')));
//app.get('/chat', (req, res) => res.sendFile(path.join(__dirname, 'views', 'chat.html')));
app.get('/group', (req, res) => res.sendFile(path.join(__dirname, 'views', 'group.html')));

// Routes
app.use('/user', userRoutes);
//app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);
app.use("/admin", adminRoutes);

// **Define associations properly**
// User.hasMany(Chat, { foreignKey: 'userId', onDelete: 'CASCADE' });
// Chat.belongsTo(User, { foreignKey: 'userId' });

// User can create multiple groups
User.hasMany(Group, { foreignKey: 'createdBy', as: 'ownedGroups', onDelete: 'CASCADE' });
Group.belongsTo(User, { foreignKey: 'createdBy', as: 'owner' });

// **Many-to-Many User and Group (Fixing Alias Conflict)**
User.belongsToMany(Group, { through: GroupMember, foreignKey: 'userId', as: 'joinedGroups' });
Group.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId', as: 'members' });

//group message associations
User.hasMany(GroupMessage, { foreignKey: "userId", onDelete: "CASCADE" });
GroupMessage.belongsTo(User, { foreignKey: "userId" });

Group.hasMany(GroupMessage, { foreignKey: "groupId", onDelete: "CASCADE" });
GroupMessage.belongsTo(Group, { foreignKey: "groupId" });

// **Sync database and start server**
sequelize
    .sync()
    .then(() => {
        console.log('Database synced successfully.');
        app.listen(4000, () => console.log('Server running at http://localhost:4000'));
    })
    .catch((error) => {
        console.error('Error syncing database:', error);
    });
