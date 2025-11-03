// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Sequelize, DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname) === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'tourism_sales',
  process.env.DB_USER || 'tourism_user',
  process.env.DB_PASSWORD || 'Tourism@123',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// ======================
// MODELS
// ======================

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { 
    type: DataTypes.ENUM('admin', 'analyst', 'viewer'), 
    defaultValue: 'viewer' 
  }
}, { 
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Destination = sequelize.define('Destination', {
  name: { type: DataTypes.STRING, allowNull: false },
  country: { type: DataTypes.STRING, allowNull: false },
  region: DataTypes.STRING,
  category: {
    type: DataTypes.ENUM('beach', 'mountain', 'city', 'historical', 'adventure', 'cultural'),
    allowNull: false
  }
}, { 
  tableName: 'destinations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const Customer = sequelize.define('Customer', {
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: false },
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  country: DataTypes.STRING,
  age_group: {
    type: DataTypes.ENUM('18-25', '26-35', '36-45', '46-55', '55+'),
    allowNull: false
  },
  customer_segment: {
    type: DataTypes.ENUM('budget', 'mid-range', 'luxury'),
    allowNull: false
  }
}, { 
  tableName: 'customers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const Tour = sequelize.define('Tour', {
  name: { type: DataTypes.STRING, allowNull: false },
  destination_id: DataTypes.INTEGER,
  duration_days: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  max_capacity: { type: DataTypes.INTEGER, allowNull: false },
  tour_type: {
    type: DataTypes.ENUM('group', 'private', 'self-guided'),
    allowNull: false
  },
  season: {
    type: DataTypes.ENUM('spring', 'summer', 'autumn', 'winter'),
    allowNull: false
  },
  difficulty_level: {
    type: DataTypes.ENUM('easy', 'moderate', 'challenging'),
    defaultValue: 'easy'
  }
}, { 
  tableName: 'tours',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const Sale = sequelize.define('Sale', {
  customer_id: DataTypes.INTEGER,
  tour_id: DataTypes.INTEGER,
  booking_date: { type: DataTypes.DATEONLY, allowNull: false },
  travel_date: { type: DataTypes.DATEONLY, allowNull: false },
  number_of_travelers: { type: DataTypes.INTEGER, allowNull: false },
  total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  booking_status: {
    type: DataTypes.ENUM('confirmed', 'pending', 'cancelled', 'completed'),
    defaultValue: 'pending'
  },
  payment_method: {
    type: DataTypes.ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer'),
    allowNull: false
  },
  booking_source: {
    type: DataTypes.ENUM('website', 'mobile_app', 'phone', 'travel_agent', 'social_media'),
    allowNull: false
  },
  discount_applied: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 }
}, { 
  tableName: 'sales',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const Service = sequelize.define('Service', {
  name: { type: DataTypes.STRING, allowNull: false },
  category: {
    type: DataTypes.ENUM('transport', 'accommodation', 'insurance', 'equipment', 'food', 'guide'),
    allowNull: false
  },
  price: { type: DataTypes.DECIMAL(8, 2), allowNull: false }
}, { 
  tableName: 'services',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const Prediction = sequelize.define('Prediction', {
  model_type: {
    type: DataTypes.ENUM('arima', 'xgboost', 'ensemble'),
    allowNull: false
  },
  prediction_date: { type: DataTypes.DATEONLY, allowNull: false },
  target_date: { type: DataTypes.DATEONLY, allowNull: false },
  destination_id: DataTypes.INTEGER,
  predicted_sales: DataTypes.DECIMAL(12, 2),
  predicted_bookings: DataTypes.INTEGER,
  confidence_interval_lower: DataTypes.DECIMAL(12, 2),
  confidence_interval_upper: DataTypes.DECIMAL(12, 2),
  accuracy_score: DataTypes.DECIMAL(5, 4)
}, { 
  tableName: 'predictions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Associations
Tour.belongsTo(Destination, { foreignKey: 'destination_id' });
Sale.belongsTo(Customer, { foreignKey: 'customer_id' });
Sale.belongsTo(Tour, { foreignKey: 'tour_id' });
Tour.hasMany(Sale, { foreignKey: 'tour_id' });
Destination.hasMany(Tour, { foreignKey: 'destination_id' });
Prediction.belongsTo(Destination, { foreignKey: 'destination_id' });

// ======================
// MIDDLEWARE
// ======================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ======================
// ROUTES
// ======================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      role: role || 'viewer'
    });
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await User.findOne({ where: { username } });
    
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CSV Upload endpoint
app.post('/api/upload-csv', authenticateToken, upload.single('csv_file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const userId = req.user.userId;

    // Store file path in user session or database for later use
    // You could create a UserUpload model to track uploaded files
    
    res.json({
      message: 'CSV file uploaded successfully',
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: filePath,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Destinations routes
app.get('/api/destinations', async (req, res) => {
  try {
    const destinations = await Destination.findAll({
      order: [['name', 'ASC']]
    });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales routes
app.get('/api/sales', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, destination_id, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (start_date) whereClause.booking_date = { [Op.gte]: start_date };
    if (end_date) whereClause.booking_date = { ...whereClause.booking_date, [Op.lte]: end_date };
    
    const sales = await Sale.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: Customer, 
          attributes: ['first_name', 'last_name', 'age_group', 'customer_segment'] 
        },
        { 
          model: Tour,
          include: [{ model: Destination }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['booking_date', 'DESC']]
    });
    
    res.json({
      sales: sales.rows,
      totalCount: sales.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(sales.count / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard analytics
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Total sales and bookings
    const totalSales = await Sale.sum('total_amount', {
      where: {
        booking_date: { [Op.gte]: startDate },
        booking_status: { [Op.in]: ['confirmed', 'completed'] }
      }
    });
    
    const totalBookings = await Sale.count({
      where: {
        booking_date: { [Op.gte]: startDate },
        booking_status: { [Op.in]: ['confirmed', 'completed'] }
      }
    });
    
    // Sales by destination
    const salesByDestination = await sequelize.query(
      `SELECT 
        d.name as destination,
        SUM(s.total_amount) as total_sales,
        COUNT(s.id) as booking_count
      FROM sales s
      JOIN tours t ON s.tour_id = t.id
      JOIN destinations d ON t.destination_id = d.id
      WHERE s.booking_date >= :startDate
        AND s.booking_status IN ('confirmed', 'completed')
      GROUP BY d.id, d.name
      ORDER BY total_sales DESC`,
      {
        replacements: { startDate: startDate.toISOString().split('T')[0] },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    res.json({
      totalSales: totalSales || 0,
      totalBookings: totalBookings || 0,
      averageBookingValue: totalBookings ? (totalSales / totalBookings) : 0,
      salesByDestination
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ML Prediction routes with CSV support
app.post('/api/predictions/generate', authenticateToken, async (req, res) => {
  try {
    const { 
      model_type = 'xgboost', 
      destination_id = 'all', 
      forecast_days = 30,
      use_uploaded_csv = false,
      csv_filename = null
    } = req.body;
    
    // Call Python ML script
    const pythonScript = path.join(__dirname, '../ml-models/predict.py');
    
    const args = [
      pythonScript,
      '--model', model_type,
      '--destination', destination_id,
      '--days', forecast_days.toString()
    ];

    // Add CSV file path if using uploaded data
    if (use_uploaded_csv && csv_filename) {
      const csvPath = path.join(__dirname, 'uploads', csv_filename);
      if (fs.existsSync(csvPath)) {
        args.push('--csv_file', csvPath);
      }
    }
    
    const pythonProcess = spawn('python', args);
    
    let predictions = '';
    let errors = '';
    
    pythonProcess.stdout.on('data', (data) => {
      predictions += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errors += data.toString();
    });
    
    pythonProcess.on('close', async (code) => {
      if (code === 0 && predictions) {
        try {
          const predictionData = JSON.parse(predictions);
          
          // Save predictions to database
          const predictionRecords = predictionData.map(pred => ({
            model_type,
            prediction_date: new Date(),
            target_date: pred.date,
            destination_id: destination_id !== 'all' ? destination_id : null,
            predicted_sales: pred.predicted_sales,
            predicted_bookings: pred.predicted_bookings,
            confidence_interval_lower: pred.confidence_lower,
            confidence_interval_upper: pred.confidence_upper,
            accuracy_score: pred.accuracy_score
          }));
          
          await Prediction.bulkCreate(predictionRecords);
          
          res.json({
            message: 'Predictions generated successfully',
            predictions: predictionData,
            source: use_uploaded_csv ? 'uploaded_csv' : 'database'
          });
        } catch (parseError) {
          res.status(500).json({ 
            error: 'Failed to parse prediction results',
            details: parseError.message 
          });
        }
      } else {
        res.status(500).json({ 
          error: 'Prediction generation failed', 
          details: errors || 'Unknown error'
        });
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/predictions', authenticateToken, async (req, res) => {
  try {
    const { model_type, destination_id, limit = 50 } = req.query;
    
    const whereClause = {};
    if (model_type) whereClause.model_type = model_type;
    if (destination_id) whereClause.destination_id = destination_id;
    
    const predictions = await Prediction.findAll({
      where: whereClause,
      include: destination_id ? [] : [{ model: Destination, required: false }],
      limit: parseInt(limit),
      order: [['prediction_date', 'DESC'], ['target_date', 'ASC']]
    });
    
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Market Basket Analysis
app.post('/api/analytics/market-basket', authenticateToken, async (req, res) => {
  try {
    const { min_support = 0.01, min_confidence = 0.3 } = req.body;
    
    const pythonScript = path.join(__dirname, '../ml-models/market_basket.py');
    
    const pythonProcess = spawn('python', [
      pythonScript,
      '--min_support', min_support.toString(),
      '--min_confidence', min_confidence.toString()
    ]);
    
    let results = '';
    let errors = '';
    
    pythonProcess.stdout.on('data', (data) => {
      results += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errors += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0 && results) {
        try {
          const analysisResults = JSON.parse(results);
          res.json({
            message: 'Market basket analysis completed',
            rules: analysisResults
          });
        } catch (parseError) {
          res.status(500).json({ 
            error: 'Failed to parse analysis results',
            details: parseError.message 
          });
        }
      } else {
        res.status(500).json({ 
          error: 'Analysis failed', 
          details: errors || 'Unknown error'
        });
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 10MB' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ error: 'Something went wrong!' });
});

// Database sync and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Uploads directory created');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`📁 CSV uploads stored in: ${uploadDir}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
