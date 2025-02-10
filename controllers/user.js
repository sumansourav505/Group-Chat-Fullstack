const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || "secrete"; // Use env variable for security

// Function to generate JWT Token
const generateAccessToken = (id, name) => {
    return jwt.sign(
        { userId: id, name: name },
        jwtSecret,
        { expiresIn: '7d' }
    );
};

// User Signup
exports.signup = async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
        });

        res.status(201).json({ message: 'User signed up successfully.', user: newUser });
    } catch (error) {
        console.error(' Signup Error:', error);
        res.status(500).json({ message: 'An error occurred during signup.' });
    }
};

// User Login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatched = await bcrypt.compare(password, user.password);

        if (!isMatched) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        const token = generateAccessToken(user.id, user.name);

        res.status(200).json({
            message: 'Login successful',
            token,
            userId: user.id, // ✅ Send userId to frontend
            name: user.name,
        });
    } catch (error) {
        console.error(' Login Error:', error);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
};
