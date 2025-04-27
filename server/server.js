require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./_middleware/error-handler');
const fs = require('fs');

// get DB name from config.json
const config = require('./config.json');
const DBName = config.DBName;

// Configure body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Configure CORS
const corsOptions = {
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // 10 minutes
};

app.use(cors(corsOptions));

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(__dirname, 'uploads', 'profiles');
const followersDir = path.join(__dirname, 'uploads', 'followers');

console.log('Ensuring upload directories exist:', {
    uploadsDir,
    profilesDir,
    followersDir
});

// Add this route to list all follower images
app.get('/uploads/followers-images', (req, res) => {
    const dir = path.join(__dirname, 'uploads', 'followers');
    fs.readdir(dir, (err, files) => {
      if (err) return res.status(500).json({ error: 'Unable to scan directory' });
      const images = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
      res.json(images);
    });
});

[uploadsDir, profilesDir, followersDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.jpg') || filePath.endsWith('.png') || filePath.endsWith('.gif')) {
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Content-Type', `image/${path.extname(filePath).substring(1)}`);
        }
    }
}));

// Serve static files from the Angular assets directory
app.use('/assets', express.static(path.join(__dirname, '../src/assets')));

// Mount the upload routes
app.use('/upload', require('./uploads/upload.routes'));

// api routes
app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/admin', require('./controllers/admin.controller'));

// Add config route - use the specific function as middleware
const configController = require('./config/config.controller');
app.get('/config', configController.getPublicConfig);

// swagger docs route
app.use('/api-docs', require('./_helpers/swagger'));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 5001;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
    console.log('Connected to DB:', DBName);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Uploads directory:', profilesDir);
});
