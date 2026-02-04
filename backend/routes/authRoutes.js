const express = require('express');
const router = express.Router();
const passport = require('passport'); // Import passport
const { protect } = require('../middleware/authMiddleware');

const {
    register,
    login,
    logout,
    getCurrentUser,
    googleCallback // Import the new controller function
} = require('../controllers/authController');

// --- Standard Auth Routes ---

// @route   POST api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   GET api/auth/user
// @desc    Get current logged-in user data
// @access  Private
router.get('/user', protect, getCurrentUser);

// @route   POST api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

// --- Google OAuth Routes ---

// @route   GET api/auth/google
// @desc    Initiate Google OAuth flow
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET api/auth/google/callback
// @desc    Handle Google OAuth callback
// @access  Public
router.get(
  '/google/callback',
  // Passport first authenticates, then passes to our controller
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`, session: false }),
  googleCallback // Our custom handler after successful authentication
);


module.exports = router;