const User = require('../models/User');
const { hashPassword, comparePassword, generateToken } = require('../middleware/auth');
const BlackList = require('../models/blackList.model');

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try{
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await hashPassword(password);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        const safeUser = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt
        };
        res.status(201).json({ user: safeUser, message: 'User registered successfully' });

    }catch(err){
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await User.findOne({ email });
        if(!user){
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await comparePassword(password, user.password);
        if(!isMatch){
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = generateToken({ userId: user._id, email: user.email });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.json({ message: 'Login successful', token });

    }catch(err){
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const logoutUser = async (req, res) => {
    const token = req.token || req.cookies?.token;
    if (!token) {
        return res.status(400).json({ message: 'No token found' });
    }

    // Add the token to the blacklist
    await BlackList.create({ token });

    // Clear the token cookie
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
}


//get user info from token
const getUserInfo = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// get all users - for testing purposes only, not exposed in routes
const getAllUsers = async (req, res) => {
    try{
        const users = await User.find().select('-password');
        res.json({ users });
    }catch(err){
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
        
};

module.exports = { registerUser, loginUser, logoutUser, getUserInfo, getAllUsers };
