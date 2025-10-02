#!/bin/bash
# test_api.sh - API Testing Script

echo "🧪 Testing Tourism Sales Predictor API"
echo "========================================"
echo ""

BASE_URL="http://localhost:5000/api"

# Test 1: Health Check
echo "1️⃣ Testing Health Check..."
curl -s $BASE_URL/health | jq '.'
echo ""

# Test 2: Register User
echo "2️⃣ Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "role": "analyst"
  }')

echo $REGISTER_RESPONSE | jq '.'
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"
echo ""

# Test 3: Login
echo "3️⃣ Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123"
  }')

echo $LOGIN_RESPONSE | jq '.'
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo ""

# Test 4: Get Destinations
echo "4️⃣ Testing Get Destinations..."
curl -s $BASE_URL/destinations | jq '.'
echo ""

# Test 5: Get Dashboard Data (requires auth)
echo "5️⃣ Testing Dashboard Analytics..."
curl -s $BASE_URL/analytics/dashboard?period=30d \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 6: Get Sales Data
echo "6️⃣ Testing Get Sales..."
curl -s "$BASE_URL/sales?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

echo "✅ API Testing Complete!"
echo ""
echo "To test ML predictions manually:"
echo "curl -X POST $BASE_URL/predictions/generate \\"
echo "  -H 'Authorization: Bearer $TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"model_type\":\"xgboost\",\"destination_id\":\"all\",\"forecast_days\":7}'"
