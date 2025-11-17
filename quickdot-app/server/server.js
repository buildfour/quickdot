require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

// Import configurations
const { initializeFirebase } = require('./config/firebase');
const { initializePolkadot } = require('./config/polkadot');

// Import middleware
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { standardRateLimit } = require('./middleware/rateLimit');

// Import routes
const walletRoutes = require('./routes/walletRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const contactRoutes = require('./routes/contactRoutes');
const userRoutes = require('./routes/userRoutes');

/**
 * QuickDot Server
 * Main Express application server
 */

const app = express();
const PORT = process.env.PORT || 8080;

// =================================================================
// MIDDLEWARE
// =================================================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development, enable in production
}));

// Compression
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(standardRateLimit);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// =================================================================
// HEALTH CHECK
// =================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// =================================================================
// API ROUTES
// =================================================================

app.use('/api/wallet', walletRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/user', userRoutes);

// API status endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'QuickDot API v1.0',
    endpoints: {
      wallet: '/api/wallet',
      transaction: '/api/transaction',
      portfolio: '/api/portfolio',
      contact: '/api/contact',
      user: '/api/user',
    },
  });
});

// =================================================================
// SERVE FRONTEND
// =================================================================

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// =================================================================
// ERROR HANDLING
// =================================================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// =================================================================
// INITIALIZE AND START SERVER
// =================================================================

const startServer = async () => {
  try {
    console.log('🚀 Starting QuickDot Server...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Initialize Firebase
    console.log('🔥 Initializing Firebase...');
    initializeFirebase();
    
    // Initialize Polkadot connection
    console.log('🔗 Connecting to Polkadot network...');
    await initializePolkadot();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('✅ Server started successfully!');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📱 API available at http://localhost:${PORT}/api`);
      console.log(`💻 Frontend available at http://localhost:${PORT}`);
      console.log(`🏥 Health check at http://localhost:${PORT}/health`);
      console.log('\n✨ QuickDot is ready to serve!\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
