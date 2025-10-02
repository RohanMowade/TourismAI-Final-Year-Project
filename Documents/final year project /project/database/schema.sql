-- Complete Tourism Sales Database Schema
-- File: database/schema.sql

USE tourism_sales;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS predictions;
DROP TABLE IF EXISTS market_basket_rules;
DROP TABLE IF EXISTS external_factors;
DROP TABLE IF EXISTS sales_services;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS tours;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS destinations;
DROP TABLE IF EXISTS users;

-- Users table for authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'analyst', 'viewer') DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Destinations table
CREATE TABLE destinations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    category ENUM('beach', 'mountain', 'city', 'historical', 'adventure', 'cultural') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    country VARCHAR(100),
    age_group ENUM('18-25', '26-35', '36-45', '46-55', '55+') NOT NULL,
    customer_segment ENUM('budget', 'mid-range', 'luxury') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tours/Packages table
CREATE TABLE tours (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    destination_id INT,
    duration_days INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    max_capacity INT NOT NULL,
    tour_type ENUM('group', 'private', 'self-guided') NOT NULL,
    season ENUM('spring', 'summer', 'autumn', 'winter') NOT NULL,
    difficulty_level ENUM('easy', 'moderate', 'challenging') DEFAULT 'easy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
);

-- Sales/Bookings table
CREATE TABLE sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    tour_id INT,
    booking_date DATE NOT NULL,
    travel_date DATE NOT NULL,
    number_of_travelers INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('confirmed', 'pending', 'cancelled', 'completed') DEFAULT 'pending',
    payment_method ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer') NOT NULL,
    booking_source ENUM('website', 'mobile_app', 'phone', 'travel_agent', 'social_media') NOT NULL,
    discount_applied DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- Additional services
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('transport', 'accommodation', 'insurance', 'equipment', 'food', 'guide') NOT NULL,
    price DECIMAL(8, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales services junction table
CREATE TABLE sales_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT,
    service_id INT,
    quantity INT DEFAULT 1,
    total_price DECIMAL(8, 2),
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_sale_service (sale_id, service_id)
);

-- External factors
CREATE TABLE external_factors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    destination_id INT,
    weather_score DECIMAL(3, 2),
    economic_index DECIMAL(5, 2),
    currency_rate DECIMAL(10, 4),
    local_events INT DEFAULT 0,
    school_holiday BOOLEAN DEFAULT FALSE,
    public_holiday BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_date_destination (date, destination_id)
);

-- Model predictions storage
CREATE TABLE predictions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    model_type ENUM('arima', 'xgboost', 'ensemble') NOT NULL,
    prediction_date DATE NOT NULL,
    target_date DATE NOT NULL,
    destination_id INT,
    predicted_sales DECIMAL(12, 2),
    predicted_bookings INT,
    confidence_interval_lower DECIMAL(12, 2),
    confidence_interval_upper DECIMAL(12, 2),
    accuracy_score DECIMAL(5, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Market basket analysis results
CREATE TABLE market_basket_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    antecedent TEXT NOT NULL,
    consequent TEXT NOT NULL,
    support_value DECIMAL(5, 4) NOT NULL,
    confidence_value DECIMAL(5, 4) NOT NULL,
    lift_value DECIMAL(5, 4) NOT NULL,
    conviction_value DECIMAL(5, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_sales_booking_date ON sales(booking_date);
CREATE INDEX idx_sales_travel_date ON sales(travel_date);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_tour ON sales(tour_id);
CREATE INDEX idx_external_factors_date ON external_factors(date);
CREATE INDEX idx_predictions_model_date ON predictions(model_type, prediction_date);

-- Insert initial data
INSERT INTO destinations (name, country, region, category) VALUES
('Goa Beaches', 'India', 'West India', 'beach'),
('Kerala Backwaters', 'India', 'South India', 'cultural'),
('Rajasthan Heritage', 'India', 'North India', 'historical'),
('Himachal Mountains', 'India', 'North India', 'mountain'),
('Mumbai City', 'India', 'West India', 'city');

INSERT INTO services (name, category, price) VALUES
('Airport Transfer', 'transport', 50.00),
('Travel Insurance', 'insurance', 25.00),
('Professional Guide', 'guide', 100.00),
('Photography Package', 'equipment', 150.00),
('Local Cuisine Tour', 'food', 75.00),
('Hotel Upgrade', 'accommodation', 200.00);

-- Insert sample customers
INSERT INTO customers (first_name, last_name, email, phone, country, age_group, customer_segment) VALUES
('Rajesh', 'Kumar', 'rajesh.kumar@email.com', '+91-9876543210', 'India', '36-45', 'mid-range'),
('Priya', 'Sharma', 'priya.sharma@email.com', '+91-9876543211', 'India', '26-35', 'luxury'),
('John', 'Smith', 'john.smith@email.com', '+1-555-0123', 'USA', '46-55', 'luxury'),
('Emma', 'Johnson', 'emma.johnson@email.com', '+44-7700-900123', 'UK', '26-35', 'mid-range'),
('Amit', 'Patel', 'amit.patel@email.com', '+91-9876543212', 'India', '18-25', 'budget'),
('Sarah', 'Williams', 'sarah.williams@email.com', '+1-555-0124', 'USA', '36-45', 'mid-range'),
('Ravi', 'Singh', 'ravi.singh@email.com', '+91-9876543213', 'India', '55+', 'luxury'),
('Lisa', 'Brown', 'lisa.brown@email.com', '+61-400-123456', 'Australia', '26-35', 'mid-range');

-- Insert sample tours
INSERT INTO tours (name, destination_id, duration_days, price, max_capacity, tour_type, season, difficulty_level) VALUES
('Goa Beach Paradise', 1, 5, 25000.00, 20, 'group', 'winter', 'easy'),
('Luxury Goa Retreat', 1, 7, 45000.00, 12, 'private', 'winter', 'easy'),
('Kerala Houseboat Experience', 2, 4, 18000.00, 15, 'group', 'autumn', 'easy'),
('Kerala Cultural Tour', 2, 6, 32000.00, 18, 'group', 'winter', 'moderate'),
('Rajasthan Royal Heritage', 3, 8, 55000.00, 16, 'group', 'winter', 'moderate'),
('Private Rajasthan Palace Tour', 3, 10, 85000.00, 8, 'private', 'winter', 'easy'),
('Himachal Trekking Adventure', 4, 7, 22000.00, 12, 'group', 'summer', 'challenging'),
('Himachal Family Package', 4, 5, 28000.00, 20, 'group', 'summer', 'easy'),
('Mumbai City Explorer', 5, 3, 15000.00, 25, 'group', 'winter', 'easy');

-- Insert sample sales (6 months of data)
INSERT INTO sales (customer_id, tour_id, booking_date, travel_date, number_of_travelers, total_amount, booking_status, payment_method, booking_source, discount_applied) VALUES
(1, 1, '2024-04-15', '2024-05-15', 2, 50000.00, 'completed', 'credit_card', 'website', 0.00),
(2, 5, '2024-04-20', '2024-06-20', 3, 165000.00, 'completed', 'credit_card', 'travel_agent', 5.00),
(3, 2, '2024-04-25', '2024-06-01', 4, 180000.00, 'completed', 'credit_card', 'website', 0.00),
(4, 3, '2024-05-05', '2024-06-05', 2, 36000.00, 'completed', 'debit_card', 'mobile_app', 10.00),
(5, 1, '2024-05-10', '2024-06-10', 1, 25000.00, 'completed', 'paypal', 'social_media', 0.00),
(6, 4, '2024-05-15', '2024-07-15', 2, 64000.00, 'completed', 'credit_card', 'website', 0.00),
(7, 6, '2024-06-01', '2024-08-01', 2, 170000.00, 'completed', 'bank_transfer', 'travel_agent', 0.00),
(8, 7, '2024-06-05', '2024-08-15', 3, 66000.00, 'confirmed', 'credit_card', 'website', 0.00),
(1, 8, '2024-06-10', '2024-08-20', 4, 112000.00, 'confirmed', 'credit_card', 'phone', 5.00),
(2, 1, '2024-07-01', '2024-08-01', 2, 50000.00, 'confirmed', 'credit_card', 'website', 0.00),
(3, 9, '2024-07-05', '2024-09-05', 1, 15000.00, 'confirmed', 'debit_card', 'mobile_app', 0.00),
(4, 2, '2024-07-10', '2024-09-10', 2, 90000.00, 'confirmed', 'credit_card', 'website', 0.00),
(5, 3, '2024-08-01', '2024-09-15', 2, 36000.00, 'confirmed', 'paypal', 'social_media', 0.00),
(6, 4, '2024-08-05', '2024-09-20', 3, 96000.00, 'confirmed', 'credit_card', 'website', 10.00),
(7, 5, '2024-08-10', '2024-10-10', 2, 110000.00, 'confirmed', 'bank_transfer', 'travel_agent', 0.00),
(8, 7, '2024-09-01', '2024-10-15', 2, 44000.00, 'confirmed', 'credit_card', 'website', 0.00),
(1, 8, '2024-09-05', '2024-11-05', 4, 112000.00, 'pending', 'credit_card', 'phone', 0.00),
(2, 1, '2024-09-10', '2024-10-10', 2, 50000.00, 'pending', 'credit_card', 'website', 5.00);

-- Insert sales_services for market basket analysis
INSERT INTO sales_services (sale_id, service_id, quantity, total_price) VALUES
(1, 1, 1, 50.00), (1, 2, 2, 50.00),
(2, 1, 1, 50.00), (2, 3, 1, 100.00), (2, 6, 1, 200.00),
(3, 1, 1, 50.00), (3, 2, 4, 100.00), (3, 4, 1, 150.00),
(4, 1, 1, 50.00), (4, 5, 2, 150.00),
(5, 2, 1, 25.00),
(6, 1, 1, 50.00), (6, 3, 1, 100.00),
(7, 1, 1, 50.00), (7, 6, 1, 200.00), (7, 3, 1, 100.00),
(8, 1, 1, 50.00), (8, 2, 3, 75.00),
(9, 1, 1, 50.00), (9, 4, 1, 150.00),
(10, 2, 2, 50.00), (10, 5, 1, 75.00);

-- Success message
SELECT 'Database schema created successfully!' AS Status;
