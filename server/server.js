const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const setupSecurityHeaders = require('./middleware/securityHeaders');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const dogRoutes = require('./routes/dogRoutes');
const reportRoutes = require('./routes/reportRoutes'); // Import report routes
const { apiLimiter } = require('./middleware/rateLimiter'); // Import general API limiter

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();


app.use(cors({
  origin: `${process.env.CLIENT_URL}`,  // Allow only trusted domains
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Security Middleware
setupSecurityHeaders(app);


// Body Parser Middleware
app.use(express.json()); // To accept JSON data in req.body
app.use(express.urlencoded({ extended: true })); // To accept form data



app.use('/api/auth', authRoutes);
app.use('/api/dogs', dogRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api', (req, res) => {
    // Explicitly set CORS headers for this route
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 
    
    console.log('API endpoint accessed!');
    res.json({ message: 'API is running...' });
  });

  app.use((req, res, next) => {
    if (req.url.startsWith('/.') || req.url.includes('._darcs') || req.url.includes('BitKeeper')) {
      res.status(403).send('Access denied');
    } else {
      next();
    }
  });

  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });



// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));