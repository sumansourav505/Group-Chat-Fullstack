const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];//1)retrive token from request header
       
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        

        const decoded = jwt.verify(token,'secrete');//2)decode the token

        // Ensure decoded token has a valid userId
        if (!decoded || !decoded.userId) {
            return res.status(400).json({ message: 'Invalid token structure.' });
        }

        const user = await User.findByPk(decoded.userId,{ attributes: ['id', 'name'] });//3)fetching the user name and id from user table as the userid

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        req.user = user; //4) Attach authenticated user to the request//
        next();
    } catch (error) {
        console.error('Authentication error:', error.name, error.message);
        
        // Check for specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        }

        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

 module.exports = { authenticate };
 