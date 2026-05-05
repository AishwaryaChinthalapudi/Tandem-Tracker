const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Utility to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a unique 6-character partner code
    const partnerCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      partnerCode
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        partnerCode: user.partnerCode,
        partnerId: user.partnerId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email, explicitly select password since we excluded it in model
    const user = await User.findOne({ email }).select('+password');

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        partnerCode: user.partnerCode,
        partnerId: user.partnerId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Link user to a partner via code
// @route   POST /api/auth/link
// @access  Private
exports.linkPartner = async (req, res) => {
  try {
    const { partnerCode } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!partnerCode) {
      return res.status(400).json({ message: 'Please provide a partner code' });
    }

    // Find the partner by code
    const partner = await User.findOne({ partnerCode });

    if (!partner) {
      return res.status(404).json({ message: 'Partner code not found' });
    }

    if (partner._id.toString() === userId) {
      return res.status(400).json({ message: 'You cannot link to yourself' });
    }

    // Update both users
    await User.findByIdAndUpdate(userId, { partnerId: partner._id });
    await User.findByIdAndUpdate(partner._id, { partnerId: userId });

    res.json({ message: 'Successfully linked with partner!', partnerId: partner._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
