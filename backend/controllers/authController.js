const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// --- Validation Helper ---
const validateRegistration = (data) => {
  const errors = [];
  if (!data.email || !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid email is required');
  }
  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (!data.name || data.name.length < 3) {
    errors.push('Name must be at least 3 characters long');
  }
  return errors;
};

// --- JWT Helper ---
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET environment variable is not set');
    throw new Error('Server configuration error [JWT]');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// --- Register Controller ---
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Log the registration attempt (without sensitive data)
    logger.info('Registration attempt:', { email, name });

    // Validate input
    const validationErrors = validateRegistration(req.body);
    if (validationErrors.length > 0) {
      logger.warn('Registration validation failed:', { email, name, errors: validationErrors });
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    // Clean and normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();

    if (existingUser) {
      logger.warn('Registration failed - existing user:', { 
        email: normalizedEmail, 
        name, 
        reason: 'Email already registered',
        existingUserId: existingUser._id 
      });
      return res.status(400).json({ 
        message: 'This email is already registered. Please use a different email or try logging in.' 
      });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    // Save user (password will be hashed by the pre-save middleware)
    await user.save();
    
    logger.info('User registered successfully:', { 
      userId: user._id, 
      email: user.email,
      name: user.name 
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    logger.error('Registration error:', { 
      message: error.message, 
      stack: error.stack,
      email: req.body?.email,
      name: req.body?.name
    });

    // Handle MongoDB duplicate key error (E11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `This ${field} is already registered. Please use a different ${field}.` 
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    // Generic server error
    res.status(500).json({ 
      message: 'Registration failed. Please try again later.' 
    });
  }
};

// --- Login Controller ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info('Login attempt:', { email });

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      logger.warn('Login failed: User not found for email:', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      logger.warn('Login failed: Invalid password for email:', { email, userId: user._id });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    logger.info('Login successful for user:', { userId: user._id, email: user.email });

    // Generate token
    const token = generateToken(user._id);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    logger.error('Login error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Login failed. Please try again later.' });
  }
};

// --- Google OAuth Callback Controller ---
const googleCallback = (req, res) => {
  try {
    // Passport attaches the authenticated user to req.user
    if (!req.user) {
      logger.error('Google callback error: req.user not populated by Passport.');
      return res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
    }

    logger.info('Google callback successful for user:', { userId: req.user.id });

    // Generate a JWT for the user
    const token = generateToken(req.user.id);

    // Redirect the user to the frontend callback URL with the token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (error) {
    logger.error('Google callback error:', { message: error.message, stack: error.stack });
    res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
  }
};

// --- Get Current User Controller ---
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      logger.error('Get user error: req.user not populated correctly by middleware');
      return res.status(500).json({ message: 'Authentication error' });
    }
    
    // Fetch fresh user data from database
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      logger.warn('Get user error: User not found in database:', { userId: req.user.id });
      return res.status(404).json({ message: 'User not found' });
    }
    
    logger.info('Fetching user data for userId:', { userId: req.user.id });
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    logger.error('Get user error:', { message: error.message, userId: req.user?.id });
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
};

// --- Logout Controller ---
const logout = (req, res) => {
  logger.info('User logged out (server-side acknowledged):', { userId: req.user?.id });
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  googleCallback
};