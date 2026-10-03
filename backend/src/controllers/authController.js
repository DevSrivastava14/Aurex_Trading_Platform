const User = require('../models/User');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    // Read the registration fields from the request body.
    const { name, email, password } = req.body || {};

    // Make sure all required fields were provided.
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Prevent registration with an email address that is already in use.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // The User model hashes the password in its pre-save middleware.
    const user = new User({ name, email, password });
    await user.save();

    // Return only public user fields, never the password or its hash.
    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to register user.', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    // Read the login credentials from the request body.
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    const authenticationError = 'Invalid email or password.';

    // Use the same error for an unknown email and an incorrect password.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: authenticationError });
    }

    // Include the user ID in a token that expires after one day.
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return public user details only; never include the password hash.
    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to log in.', error: error.message });
  }
};

module.exports = { registerUser, loginUser };