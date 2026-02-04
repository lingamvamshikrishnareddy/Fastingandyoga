// config/passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
        scope: ['profile', 'email'], // Explicitly request only needed scopes
        passReqToCallback: true // Pass req to callback for additional security checks
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // 1. Validate required profile data
          if (!profile.id || !profile.emails || !profile.emails[0]) {
            logger.error('Google OAuth: Incomplete profile data received', {
              profileId: profile.id,
              hasEmails: !!profile.emails,
              emailCount: profile.emails ? profile.emails.length : 0
            });
            return done(new Error('Incomplete profile data from Google'), false);
          }

          const email = profile.emails[0].value;
          const displayName = profile.displayName;

          // 2. Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            logger.error('Google OAuth: Invalid email format', { email });
            return done(new Error('Invalid email format'), false);
          }

          // 3. Security: Check for suspicious activity
          if (req && req.ip) {
            // Log OAuth attempt for monitoring
            logger.info('Google OAuth attempt', {
              email: email,
              ip: req.ip,
              userAgent: req.get('User-Agent'),
              googleId: profile.id
            });
          }

          // 4. Prepare sanitized user data
          const newUserData = {
            googleId: profile.id,
            name: displayName || email.split('@')[0], // Fallback if no display name
            email: email.toLowerCase().trim(), // Normalize email
            emailVerified: true, // Google emails are pre-verified
            provider: 'google',
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            createdAt: new Date(),
            lastLogin: new Date(),
            isActive: true
          };

          // 5. Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            // Update last login and any changed info
            user.lastLogin = new Date();
            user.isActive = true;
            
            // Update avatar if changed
            if (newUserData.avatar && user.avatar !== newUserData.avatar) {
              user.avatar = newUserData.avatar;
            }
            
            // Update name if changed and user hasn't customized it
            if (displayName && user.name !== displayName && user.nameCustomized !== true) {
              user.name = displayName;
            }
            
            await user.save();
            logger.info('Google OAuth: Existing user found by Google ID - updated login info', { 
              userId: user._id,
              email: user.email
            });
            return done(null, user);
          }

          // 6. Check if user exists with this email (account linking)
          user = await User.findOne({ email: email.toLowerCase() });
          if (user) {
            // Security check: Only link if account is active
            if (user.isActive === false) {
              logger.warn('Google OAuth: Attempt to link with deactivated account', {
                email: email,
                userId: user._id
              });
              return done(new Error('Account is deactivated'), false);
            }

            // Link Google account to existing email account
            user.googleId = profile.id;
            user.provider = user.provider || 'google'; // Keep original provider if exists
            user.emailVerified = true; // Mark as verified since Google verified it
            user.lastLogin = new Date();
            user.avatar = user.avatar || newUserData.avatar; // Keep existing avatar if set
            
            await user.save();
            logger.info('Google OAuth: Existing user found by email - linked Google account', { 
              userId: user._id,
              email: user.email
            });
            return done(null, user);
          }

          // 7. Create new user
          // Additional validation before creating
          if (newUserData.name.length < 1 || newUserData.name.length > 100) {
            logger.error('Google OAuth: Invalid name length', { 
              name: newUserData.name,
              length: newUserData.name.length 
            });
            return done(new Error('Invalid name format'), false);
          }

          // Check if we've hit user creation limits (basic rate limiting)
          const recentUsers = await User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 60000) }, // Last minute
            provider: 'google'
          });

          if (recentUsers > 50) { // More than 50 new Google users in last minute
            logger.warn('Google OAuth: High user creation rate detected', {
              recentUsers,
              ip: req?.ip
            });
            // Don't block completely, but log for monitoring
          }

          user = await User.create(newUserData);
          
          logger.info('Google OAuth: New user created successfully', { 
            userId: user._id,
            email: user.email,
            provider: 'google'
          });
          
          return done(null, user);

        } catch (err) {
          logger.error('Passport Google Strategy Error', { 
            message: err.message, 
            stack: err.stack,
            profileId: profile?.id,
            email: profile?.emails?.[0]?.value
          });

          // Handle specific database errors
          if (err.code === 11000) {
            // Duplicate key error
            logger.error('Google OAuth: Duplicate key error during user creation', {
              error: err.message,
              keyPattern: err.keyPattern
            });
            return done(new Error('Account creation failed - duplicate data'), false);
          }

          if (err.name === 'ValidationError') {
            logger.error('Google OAuth: User validation failed', {
              errors: err.errors
            });
            return done(new Error('Invalid user data'), false);
          }

          return done(err, false);
        }
      }
    )
  );

  // Note: We don't need serializeUser/deserializeUser for JWT-based auth
  // But if you ever need session-based auth, uncomment and modify these:
  /*
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
  */
};
