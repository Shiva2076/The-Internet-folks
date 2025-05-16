const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateSignup, validateSignin } = require('../utils/validators');
require('dotenv').config();

exports.signup = async (req, res) => {
  try {
    const { error } = validateSignup(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        errors: [{ message: error.details[0].message }]
      });
    }

    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        errors: [{ message: 'User already exists.' }]
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(201).json({
      status: true,
      content: {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        },
        meta: {
          access_token: token
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, errors: [{ message: 'Server error' }] });
  }
};

exports.signin = async (req, res) => {
  try {
    const { error } = validateSignin(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        errors: [{ message: error.details[0].message }]
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({
        status: false,
        errors: [{ message: 'Invalid credentials.' }]
      });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        errors: [{ message: 'Invalid credentials.' }]
      });
    }
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(200).json({
      status: true,
      content: {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        },
        meta: {
          access_token: token
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, errors: [{ message: 'Server error' }] });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id }, { password: 0 });
    
    if (!user) {
      return res.status(404).json({
        status: false,
        errors: [{ message: 'User not found.' }]
      });
    }
    
    res.status(200).json({
      status: true,
      content: {
        data: user
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, errors: [{ message: 'Server error' }] });
  }
};