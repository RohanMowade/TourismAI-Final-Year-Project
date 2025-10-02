USE tourism_sales;

-- Add more customers
INSERT INTO customers (first_name, last_name, email, phone, country, age_group, customer_segment) VALUES
('Michael', 'Chen', 'michael.chen@email.com', '+86-138-0000-0001', 'China', '26-35', 'luxury'),
('Sofia', 'Garcia', 'sofia.garcia@email.com', '+34-600-000-001', 'Spain', '36-45', 'mid-range'),
('David', 'Wilson', 'david.wilson@email.com', '+1-555-0125', 'USA', '46-55', 'budget'),
('Anna', 'Schmidt', 'anna.schmidt@email.com', '+49-170-0000001', 'Germany', '26-35', 'luxury'),
('Yuki', 'Tanaka', 'yuki.tanaka@email.com', '+81-90-0000-0001', 'Japan', '18-25', 'mid-range');

-- Add more sales for better predictions
INSERT INTO sales (customer_id, tour_id, booking_date, travel_date, number_of_travelers, total_amount, booking_status, payment_method, booking_source, discount_applied)
SELECT 
    (FLOOR(1 + RAND() * 13)) as customer_id,
    (FLOOR(1 + RAND() * 9)) as tour_id,
    DATE_SUB(CURDATE(), INTERVAL FLOOR(RAND() * 180) DAY) as booking_date,
    DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 90) DAY) as travel_date,
    FLOOR(1 + RAND() * 4) as number_of_travelers,
    (15000 + FLOOR(RAND() * 70000)) as total_amount,
    'confirmed' as booking_status,
    ELT(FLOOR(1 + RAND() * 4), 'credit_card', 'debit_card', 'paypal', 'bank_transfer') as payment_method,
    ELT(FLOOR(1 + RAND() * 5), 'website', 'mobile_app', 'phone', 'travel_agent', 'social_media') as booking_source,
    (FLOOR(RAND() * 3) * 5) as discount_applied
FROM 
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t2,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t3
LIMIT 50;

SELECT 'Added 50 more sales records' as Status;
