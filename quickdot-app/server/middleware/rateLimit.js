/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting request rates
 */

// Simple in-memory rate limiter
const rateLimitStore = new Map();

/**
 * Clean up old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 0) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Rate limit middleware
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Maximum requests per window
 */
const rateLimit = (windowMs = 900000, maxRequests = 100) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    let data = rateLimitStore.get(key);
    
    if (!data || now > data.resetTime) {
      // Create new entry or reset
      data = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, data);
      
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      res.setHeader('X-RateLimit-Reset', new Date(data.resetTime).toISOString());
      
      return next();
    }
    
    data.count++;
    
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - data.count));
    res.setHeader('X-RateLimit-Reset', new Date(data.resetTime).toISOString());
    
    if (data.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil((data.resetTime - now) / 1000),
      });
    }
    
    next();
  };
};

/**
 * Strict rate limit for sensitive operations
 */
const strictRateLimit = rateLimit(300000, 10); // 10 requests per 5 minutes

/**
 * Standard rate limit
 */
const standardRateLimit = rateLimit(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
);

module.exports = {
  rateLimit,
  strictRateLimit,
  standardRateLimit,
};
