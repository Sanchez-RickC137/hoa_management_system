const rateLimit = require('express-rate-limit');

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3, // limit each IP to 3 requests per window
  message: {
    error: 'Too many password reset attempts. Please try again in an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  passwordResetLimiter
};