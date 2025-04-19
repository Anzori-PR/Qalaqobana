const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'საჭიროა ყველა ველის შევსება' });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ username }, { email }] });
    
    if (user) {
      return res.status(400).json({ message: 'მომხმარებელი უკვე რაგისტრირებულია' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password // The password will be hashed by the pre-save middleware
    });

    await user.save();

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'რეგისტრაციისას წარმოიშვა შეცდომა' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'საჭიროა ემაილი და პაროლი' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'მომხმარებელი არ მოიძებნა' });
    }

    // Verify password using the User model's comparePassword method
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'არასწორი პაროლი' });
    }

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          return res.status(500).json({ message: 'შესვლისას წარმოიშვა შეცდომა' });
        }
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'შესვლისას წარმოიშვა შეცდომა' });
  }
});


module.exports = router; 