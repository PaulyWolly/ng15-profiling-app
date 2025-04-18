require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./_middleware/error-handler');

// get DB name from config.json
const config = require('./config.json');
const DBName = config.DBName;

// Configure body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure CORS
const corsOptions = {
    origin: true, // reflect the request origin
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // 10 minutes
};

app.use(cors(corsOptions));

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads', 'profiles');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// api routes
app.use('/accounts', require('./accounts/accounts.controller'));

// swagger docs route
app.use('/api-docs', require('./_helpers/swagger'));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 6001;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
    console.log('Connected to DB:', DBName);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Uploads directory:', uploadsDir);
});
