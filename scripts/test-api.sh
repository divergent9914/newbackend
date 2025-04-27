#!/bin/bash

# Script to test API endpoints

# Print banner
echo "====================================================="
echo "             Testing API Endpoints                   "
echo "====================================================="

# Default API URL
API_URL=${1:-"http://localhost:3001"}

# Function to test an endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local description=$3
  local data=$4

  echo "Testing $description ($method $endpoint)..."
  
  if [ "$method" == "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  # Extract status code from response
  status_code=$(echo "$response" | tail -n1)
  response_body=$(echo "$response" | sed '$d')
  
  # Check status code range
  if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
    echo "✅ Success ($status_code)"
    # Pretty print JSON if it's valid
    if echo "$response_body" | jq '.' > /dev/null 2>&1; then
      echo "$response_body" | jq '.' | head -n 20
      lines=$(echo "$response_body" | wc -l)
      if [ $lines -gt 20 ]; then
        echo "... (truncated, $lines lines total)"
      fi
    else
      echo "$response_body" | head -n 5
    fi
  else
    echo "❌ Failed ($status_code)"
    echo "$response_body"
  fi
  echo "-----------------------------------------------------"
}

# Test basic health endpoint
test_endpoint "GET" "/status" "Health status"

# Test products endpoint
test_endpoint "GET" "/products" "Product listing"

# Test categories endpoint
test_endpoint "GET" "/categories" "Categories listing"

# Test single product endpoint (assumes product with ID 1 exists)
test_endpoint "GET" "/products/1" "Single product"

# Test authentication (simulating a login attempt)
test_endpoint "POST" "/auth/login" "Login attempt" '{"username": "testuser", "password": "password123"}'

# Test orders endpoint (requires authentication, may fail)
test_endpoint "GET" "/orders" "Orders listing"

# Test ONDC protocol endpoints (basic structure testing)
test_endpoint "POST" "/ondc/search" "ONDC search" '{"context": {"domain": "nic2004:52110", "country": "IND", "city": "std:080", "action": "search", "core_version": "1.0.0"}, "message": {"intent": {"item": {"descriptor": {"name": "pizza"}}}}}'

# Print summary
echo "====================================================="
echo "API Testing Complete"
echo "For more comprehensive testing, consider using a tool like Postman"
echo "or implement integration tests with Jest/Supertest."
echo "====================================================="