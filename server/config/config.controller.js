const config = require('../config.json');
const jwt = require('jsonwebtoken');

module.exports = {
    getPublicConfig
};

function getPublicConfig(req, res) {
    // Verify the user is authenticated
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, config.secret);
        const userId = decoded.id;
        
        if (!userId) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        // Return only the public configuration that's needed by the client
        // Never return sensitive server-side configuration
        return res.json({
            apiKeys: {
                googleMaps: config.apiKeys?.googleMaps || ''
            }
        });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
} 