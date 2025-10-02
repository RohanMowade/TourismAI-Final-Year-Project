# Tourism Sales Prediction & Data Mining Platform

A full-stack web application for predictive analysis and data mining in the tourism sector using machine learning.

## 🚀 Features

- **Dashboard Analytics**: Real-time sales metrics and visualizations
- **ML Predictions**: 
  - ARIMA for time series forecasting
  - XGBoost for regression-based predictions
  - Ensemble models for improved accuracy
- **Market Basket Analysis**: Apriori algorithm for service association rules
- **User Authentication**: Secure login with JWT tokens
- **RESTful API**: Express.js backend with MySQL database

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Recharts for data visualization
- Lucide React for icons
- Axios for API calls

### Backend
- Node.js with Express.js
- Sequelize ORM
- MySQL database
- JWT authentication
- BCrypt for password hashing

### Machine Learning
- Python 3.8+
- Scikit-learn
- XGBoost
- Statsmodels (ARIMA)
- MLxtend (Apriori)
- Pandas & NumPy

## 📋 Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd tourism-sales-predictor
```

### 2. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE tourism_sales;
CREATE USER 'tourism_user'@'localhost' IDENTIFIED BY 'Tourism@123';
GRANT ALL PRIVILEGES ON tourism_sales.* TO 'tourism_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u tourism_user -p tourism_sales < database/schema.sql
```

### 3. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Start backend server
npm run dev
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install

# Start frontend development server
npm run dev
```

### 5. ML Models Setup
```bash
cd ../ml-models

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## 🚦 Running the Application

### Start all services:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - ML Models (optional, runs on-demand):**
```bash
cd ml-models
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

### Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Default Login Credentials:
Create a user via the registration page or use the API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

## 📊 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Analytics
- GET `/api/analytics/dashboard?period=30d` - Dashboard metrics
- POST `/api/analytics/market-basket` - Run market basket analysis

### Predictions
- POST `/api/predictions/generate` - Generate ML predictions
- GET `/api/predictions` - Get stored predictions

### Data
- GET `/api/destinations` - Get all destinations
- GET `/api/sales` - Get sales data (authenticated)

## 🤖 ML Models Usage

### Generate Predictions
```bash
# XGBoost predictions
python predict.py --model xgboost --destination all --days 30

# ARIMA predictions
python predict.py --model arima --destination 1 --days 30

# Ensemble predictions
python predict.py --model ensemble --destination all --days 30
```

### Market Basket Analysis
```bash
python market_basket.py --min_support 0.01 --min_confidence 0.3
```

## 📁 Project Structure

```
tourism-sales-predictor/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── App.jsx          # Main app component
│   │   ├── services/        # API services
│   │   └── index.css        # Tailwind styles
│   └── package.json
├── backend/                  # Express backend
│   ├── server.js            # Main server file
│   ├── .env                 # Environment variables
│   └── package.json
├── ml-models/               # Python ML models
│   ├── predict.py           # Prediction script
│   ├── market_basket.py     # Market basket analysis
│   ├── config.py            # Configuration
│   └── requirements.txt     # Python dependencies
├── database/                # Database files
│   └── schema.sql          # Database schema
└── README.md
```

## 🔍 Features in Detail

### Dashboard
- Total sales and bookings metrics
- Sales by destination visualization
- Booking distribution charts
- Time period filters (7d, 30d, 90d)

### ML Predictions
- Choose between ARIMA, XGBoost, or Ensemble models
- Select specific destinations or all destinations
- Forecast sales for 7-90 days
- Confidence intervals displayed
- Accuracy scores for each model

### Market Basket Analysis
- Discover service associations
- Support, confidence, and lift metrics
- Identify cross-selling opportunities
- Customizable thresholds

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:5000/api/health

# Get destinations
curl http://localhost:5000/api/destinations
```

### Test ML Models
```bash
cd ml-models
python predict.py --model xgboost --destination all --days 7
python market_basket.py
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
mysql --version
systemctl status mysql  # Linux
brew services list      # Mac

# Reset user permissions
mysql -u root -p
GRANT ALL PRIVILEGES ON tourism_sales.* TO 'tourism_user'@'localhost';
FLUSH PRIVILEGES;
```

### Python Module Errors
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Or install individually
pip install pandas numpy scikit-learn xgboost statsmodels mysql-connector-python mlxtend
```

### Port Already in Use
```bash
# Change ports in configuration files
# Frontend: vite.config.js (default 3000)
# Backend: .env PORT variable (default 5000)
```

## 📈 Future Enhancements

- [ ] Real-time data updates with WebSockets
- [ ] Advanced data visualization with D3.js
- [ ] Export reports to PDF/Excel
- [ ] Email notifications for predictions
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📧 Contact

For questions or support, please contact: your-email@example.com

## 🙏 Acknowledgments

- React and Vite teams
- Scikit-learn community
- XGBoost developers
- Statsmodels contributors
