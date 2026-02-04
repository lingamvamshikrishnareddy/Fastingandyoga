// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const User = require('../models/User');

// Token blacklist - In production, use Redis or database
const tokenBlacklist = new Set();

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Extract token from header
            token = req.headers.authorization.split(' ')[1];
            
            // 2. Verify JWT_SECRET is available
            if (!process.env.JWT_SECRET) {
                logger.error('JWT_SECRET environment variable is not set');
                return res.status(500).json({ 
                    success: false,
                    message: 'Server configuration error' 
                });
            }
            
            // 3. Check if token is blacklisted (for logout functionality)
            if (tokenBlacklist.has(token)) {
                logger.warn('Attempt to use blacklisted token:', { 
                    tokenPrefix: token.substring(0, 10) 
                });
                return res.status(401).json({ 
                    success: false,
                    message: 'Token has been invalidated' 
                });
            }
            
            // 4. Verify the token using the secret with additional options
            const decoded = jwt.verify(token, process.env.JWT_SECRET, {
                algorithms: ['HS256'], // Explicitly specify allowed algorithms
                maxAge: '24h' // Additional time check
            });
            
            // 5. Validate token structure
            if (!decoded.id || !decoded.iat || !decoded.exp) {
                logger.warn('Invalid token structure:', { decoded });
                return res.status(401).json({ 
                    success: false,
                    message: 'Invalid token format' 
                });
            }
            
            // 6. Check if token is too old (additional security layer)
            const tokenAge = Date.now() - (decoded.iat * 1000);
            const maxTokenAge = 24 * 60 * 60 * 1000; // 24 hours
            if (tokenAge > maxTokenAge) {
                logger.warn('Token too old:', { 
                    tokenAge: tokenAge / 1000 / 60 / 60, 
                    userId: decoded.id 
                });
                return res.status(401).json({ 
                    success: false,
                    message: 'Token expired due to age' 
                });
            }
            
            // 7. Fetch user from database with security checks
            const user = await User.findById(decoded.id)
                .select('-password -__v') // Exclude sensitive fields
                .lean();
            
            if (!user) {
                logger.warn('Token valid but user not found:', { userId: decoded.id });
                return res.status(401).json({ 
                    success: false,
                    message: 'User account no longer exists' 
                });
            }
            
            // 8. Check if user account is active (if you have this field)
            if (user.isActive === false) {
                logger.warn('Token valid but user account deactivated:', { userId: decoded.id });
                return res.status(401).json({ 
                    success: false,
                    message: 'User account has been deactivated' 
                });
            }
            
            // 9. Check for password change after token issuance (if you track this)
            if (user.passwordChangedAt && decoded.iat < (user.passwordChangedAt.getTime() / 1000)) {
                logger.warn('Token issued before password change:', { userId: decoded.id });
                return res.status(401).json({ 
                    success: false,
                    message: 'Password was changed. Please log in again.' 
                });
            }
            
            // 10. Attach sanitized user data to request
            req.user = {
                id: user._id.toString(),
                googleId: user.googleId,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role || 'user',
                emailVerified: user.emailVerified || false
            };
            
            // 11. Add token info for potential refresh logic
            req.tokenInfo = {
                iat: decoded.iat,
                exp: decoded.exp,
                jti: decoded.jti // if you add JWT ID
            };
            
            // 12. Rate limiting per user (optional)
            req.userRateLimit = {
                userId: user._id.toString(),
                timestamp: Date.now()
            };
            
            next();
            
        } catch (error) {
            logger.error('Token verification failed in authMiddleware:', {
                name: error.name,
                message: error.message,
                tokenPrefix: token ? `${token.substring(0, 10)}...` : 'none',
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            // Handle specific JWT errors
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Token has expired',
                    code: 'TOKEN_EXPIRED'
                });
            }
            
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Invalid token',
                    code: 'TOKEN_INVALID'
                });
            }
            
            if (error.name === 'NotBeforeError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Token not yet valid',
                    code: 'TOKEN_NOT_BEFORE'
                });
            }
            
            return res.status(401).json({ 
                success: false,
                message: 'Authentication failed',
                code: 'AUTH_FAILED'
            });
        }
    } else {
        // No token provided
        logger.warn('No authorization token provided', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path
        });
        return res.status(401).json({ 
            success: false,
            message: 'Access token required',
            code: 'NO_TOKEN'
        });
    }
};

// Optional: Admin role check middleware
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        logger.warn('Admin access attempted by non-admin user:', { 
            userId: req.user?.id,
            role: req.user?.role 
        });
        return res.status(403).json({ 
            success: false,
            message: 'Admin access required' 
        });
    }
};

// Optional: Email verification check
const requireVerifiedEmail = (req, res, next) => {
    if (req.user && req.user.emailVerified) {
        next();
    } else {
        return res.status(403).json({ 
            success: false,
            message: 'Email verification required',
            code: 'EMAIL_NOT_VERIFIED'
        });
    }
};

// Token blacklisting function (for logout)
const blacklistToken = (token) => {
    tokenBlacklist.add(token);
    // In production, store in Redis with TTL equal to token expiry
    // redis.setex(`blacklist:${token}`, tokenExpiry, 'true');
};

// Clean up expired tokens from blacklist (run periodically)
const cleanupBlacklist = () => {
    // This is a simple in-memory implementation
    // In production, Redis TTL handles this automatically
    const now = Math.floor(Date.now() / 1000);
    for (const token of tokenBlacklist) {
        try {
            const decoded = jwt.decode(token);
            if (decoded && decoded.exp < now) {
                tokenBlacklist.delete(token);
            }
        } catch (error) {
            // Invalid token, remove it
            tokenBlacklist.delete(token);
        }
    }
};

// Run cleanup every hour
setInterval(cleanupBlacklist, 60 * 60 * 1000);

module.exports = { 
    protect, 
    requireAdmin, 
    requireVerifiedEmail,
    blacklistToken 
};
