const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')
const validate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Access attempted without token!');
    return res.status(401).json({
      success: false,
      message: 'Authorization required',
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Invalid token attempt!', err.message);
      return res.status(403).json({
        success: false,
        message: 'Invalid token',
      });
    }

    req.user = user;
    next(); // ✅ move inside this block
  });
};

module.exports = validate;
