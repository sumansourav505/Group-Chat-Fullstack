const express = require('express');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/database');

const User = require('./models/user');
const Chat = require('./models/chat');

const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve static pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'views', 'signup.html')));
app.get('/chat', (req, res) => res.sendFile(path.join(__dirname, 'views', 'chat.html')));

// Routes
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);

// Define associations
User.hasMany(Chat, { foreignKey: 'userId' });
Chat.belongsTo(User, { foreignKey: 'userId' });

// Server start
sequelize
    .sync({})
    .then(() => {
        console.log('Database synced successfully.');
        app.listen(4000, () => console.log('Server running at http://localhost:4000'));
    })
    .catch((error) => {
        console.error('Error syncing database:', error);
    });
