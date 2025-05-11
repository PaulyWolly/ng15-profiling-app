const jwt = require('jsonwebtoken');
const config = require('../config.json');

module.exports = {
  isAdmin: (req, res, next) => {
    // Get token from session
    const token = req.session?.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.secret);
      
      // Check if user has admin role
      if (decoded.role !== 'Admin' && decoded.role !== 'Super-Admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Add user info to request
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
}; 