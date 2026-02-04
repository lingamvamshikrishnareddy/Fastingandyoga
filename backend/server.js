// --- Load Environment Variables FIRST ---
require('dotenv').config();

// --- Standard Imports ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const helmet = require('helmet'); // Install with: npm install helmet
const rateLimit = require('express-rate-limit'); // Install with: npm install express-rate-limit

// --- Custom Modules & Config ---
const connectDB = require('./config/db');
require('./config/passport')(passport);

// Import routes
const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const progressRoutes = require('./routes/progressRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const fastRoutes = require('./routes/fastRoutes');

// Import protect middleware
const { protect } = require('./middleware/authMiddleware');

// --- Initialize Express App ---
const app = express();

// Set mongoose strictQuery to false to suppress deprecation warning
mongoose.set('strictQuery', false);

// --- TRUST PROXY CONFIGURATION (CRITICAL FOR DEPLOYED APPS) ---
// This must be set before rate limiting middleware
if (process.env.NODE_ENV === 'production') {
  // In production, trust the first proxy (Render's load balancer)
  app.set('trust proxy', 1);
} else {
  // In development, you might not be behind a proxy
  // But if you're testing with a proxy, set this to true
  app.set('trust proxy', process.env.TRUST_PROXY === 'true');
}

// --- SECURITY MIDDLEWARE (Add before other middleware) ---

// 1. Security Headers with Helmet
app.use(helmet({
  // Clickjacking Protection - FIXES THE REPORTED VULNERABILITY
  frameguard: { 
    action: 'deny' // Completely prevents framing
    // Alternative: action: 'sameorigin' - allows framing only from same origin
  },
  
  // Content Security Policy - Prevents XSS and other injection attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.fastandyoga.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"], // Additional clickjacking protection
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    }
  },
  
  // HSTS - Forces HTTPS in production
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // XSS Protection
  xssFilter: true,
  
  // Referrer Policy
  referrerPolicy: { policy: "same-origin" }
}));

// 2. Rate Limiting - Prevents brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Optional: Add skip function to exclude certain IPs or conditions
  skip: (req, res) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60
  }
});

// 3. Additional Custom Security Headers
app.use((req, res, next) => {
  // Remove server signature
  res.removeHeader('X-Powered-By');
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY'); // Backup clickjacking protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Cache control for sensitive routes
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/dashboard')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
  }
  
  next();
});

// --- CORS Configuration ---
const allowedOrigins = [
  'https://www.fastandyoga.com',
  'https://fastandyoga.com',
  'http://localhost:3000',
  'http://localhost:3001'
];

const corsOrigins = process.env.CLIENT_URL
  ? [
      process.env.CLIENT_URL.replace(/\/$/, ''),
      process.env.CLIENT_URL.replace(/\/$/, '') + '/'
    ]
  : allowedOrigins;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining']
}));

// --- Body Parsers with Size Limits ---
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: false, 
  limit: '10mb' 
}));

// --- Cookie Parser with Security Options ---
app.use(cookieParser());

// --- Passport Middleware ---
app.use(passport.initialize());

// --- Request Logging Middleware (for monitoring) ---
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const forwardedFor = req.get('X-Forwarded-For') || 'none';
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${clientIP} - X-Forwarded-For: ${forwardedFor}`);
  next();
});

// --- Health Check Route ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    corsOrigins: corsOrigins,
    security: {
      headersEnabled: true,
      rateLimitingEnabled: true,
      clickjackingProtection: true,
      trustProxy: app.get('trust proxy')
    },
    clientIP: req.ip,
    forwardedFor: req.get('X-Forwarded-For')
  });
});

// --- API Routes ---
// Authentication Routes with stricter rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Protected API Routes
app.use('/api/fasts', protect, fastRoutes);
app.use('/api/goals', protect, goalRoutes);
app.use('/api/progress', protect, progressRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);

// --- 404 Handler for API Routes ---
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error("Global Error Handler Caught:");
  console.error(err.stack);
  
  // Handle specific error types
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation'
    });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Request payload too large'
    });
  }
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// --- Server Initialization ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`🔒 Security headers enabled - Clickjacking protection active`);
      console.log(`🌐 CORS configured for origins:`, corsOrigins);
      console.log(`⚡ Rate limiting active: 100 req/15min general, 5 req/15min auth`);
      console.log(`🔗 Trust proxy setting: ${app.get('trust proxy')}`);
      
      // Security checks
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.warn('⚠️  WARNING: Google OAuth credentials not set in .env file');
      }
      
      if (!process.env.JWT_SECRET) {
        console.warn('⚠️  WARNING: JWT_SECRET not set in .env file - this is a security risk!');
      }
      
      if (process.env.NODE_ENV === 'production') {
        console.log('🔐 Production security measures active');
      } else {
        console.log('🔧 Development mode - some security features relaxed');
      }
    });
  } catch (error) {
    console.error(`💥 FATAL: Failed to start server - ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = { app };
