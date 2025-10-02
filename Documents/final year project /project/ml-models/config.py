# ml-models/config.py
import os

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'tourism_user'),
    'password': os.getenv('DB_PASSWORD', 'Rohan@123'),
    'database': os.getenv('DB_NAME', 'tourism_sales')
}

# ML Model parameters
ARIMA_PARAMS = {
    'order': (1, 1, 1),
    'seasonal_order': (1, 1, 1, 7)
}

XGBOOST_PARAMS = {
    'max_depth': 6,
    'learning_rate': 0.1,
    'n_estimators': 100,
    'objective': 'reg:squarederror',
    'random_state': 42
}

APRIORI_PARAMS = {
    'min_support': 0.01,
    'min_confidence': 0.3,
    'min_lift': 1.0
}
