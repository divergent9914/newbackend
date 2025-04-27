# API Endpoints Documentation

This document outlines the available API endpoints in the ONDC E-commerce System.

## Base URL

In development: `http://localhost:3001/api`
In production: `https://your-domain.com/api`

## Authentication

### Login

```
POST /auth/login
```

Request body:
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  },
  "token": "jwt-token"
}
```

## Products

### Get All Products

```
GET /products
```

Query parameters:
- `category` (optional): Filter by category
- `search` (optional): Search term
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

Response:
```json
{
  "products": [
    {
      "id": 1,
      "name": "string",
      "description": "string",
      "price": 10.99,
      "category": "string",
      "imageUrl": "string",
      "stock": 100,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### Get Product by ID

```
GET /products/:id
```

Path parameters:
- `id`: Product ID

Response:
```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "price": 10.99,
  "category": "string",
  "imageUrl": "string",
  "stock": 100,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Create Product

```
POST /products
```

Request body:
```json
{
  "name": "string",
  "description": "string",
  "price": 10.99,
  "category": "string",
  "imageUrl": "string",
  "stock": 100
}
```

Response:
```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "price": 10.99,
  "category": "string",
  "imageUrl": "string",
  "stock": 100,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Update Product

```
PUT /products/:id
```

Path parameters:
- `id`: Product ID

Request body:
```json
{
  "name": "string",
  "description": "string",
  "price": 10.99,
  "category": "string",
  "imageUrl": "string",
  "stock": 100
}
```

Response:
```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "price": 10.99,
  "category": "string",
  "imageUrl": "string",
  "stock": 100,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Delete Product

```
DELETE /products/:id
```

Path parameters:
- `id`: Product ID

Response:
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

## Orders

### Get All Orders

```
GET /orders
```

Query parameters:
- `userId` (optional): Filter by user ID
- `status` (optional): Filter by status
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

Response:
```json
{
  "orders": [
    {
      "id": 1,
      "userId": 1,
      "status": "string",
      "totalAmount": 100.99,
      "items": [
        {
          "id": 1,
          "productId": 1,
          "quantity": 2,
          "price": 10.99,
          "productName": "string"
        }
      ],
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

### Get Order by ID

```
GET /orders/:id
```

Path parameters:
- `id`: Order ID

Response:
```json
{
  "id": 1,
  "userId": 1,
  "status": "string",
  "totalAmount": 100.99,
  "items": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "price": 10.99,
      "productName": "string"
    }
  ],
  "payment": {
    "id": 1,
    "method": "string",
    "amount": 100.99,
    "status": "string",
    "transactionId": "string"
  },
  "delivery": {
    "id": 1,
    "address": "string",
    "status": "string",
    "trackingId": "string",
    "estimatedDelivery": "timestamp"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Create Order

```
POST /orders
```

Request body:
```json
{
  "userId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "delivery": {
    "address": "string",
    "contactPhone": "string"
  },
  "payment": {
    "method": "string",
    "transactionId": "string"
  }
}
```

Response:
```json
{
  "id": 1,
  "userId": 1,
  "status": "created",
  "totalAmount": 100.99,
  "items": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "price": 10.99,
      "productName": "string"
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Update Order Status

```
PUT /orders/:id
```

Path parameters:
- `id`: Order ID

Request body:
```json
{
  "status": "string"
}
```

Response:
```json
{
  "id": 1,
  "userId": 1,
  "status": "string",
  "totalAmount": 100.99,
  "updatedAt": "timestamp"
}
```

## ONDC Integration

### ONDC Search

```
POST /ondc/search
```

Request body:
```json
{
  "context": {
    "domain": "string",
    "country": "string",
    "city": "string",
    "action": "search",
    "timestamp": "string"
  },
  "message": {
    "intent": {
      "category": {
        "id": "string"
      },
      "item": {
        "descriptor": {
          "name": "string"
        }
      },
      "fulfillment": {
        "type": "string",
        "stops": [
          {
            "location": {
              "gps": "string"
            }
          }
        ]
      }
    }
  }
}
```

Response follows ONDC protocol format.

### ONDC Select

```
POST /ondc/select
```

Request body follows ONDC protocol format.

### ONDC Initialize

```
POST /ondc/init
```

Request body follows ONDC protocol format.

### ONDC Confirm

```
POST /ondc/confirm
```

Request body follows ONDC protocol format.

### ONDC Status

```
POST /ondc/status
```

Request body follows ONDC protocol format.

## API Routes Management

### Get All API Routes

```
GET /api-routes
```

Response:
```json
[
  {
    "id": 1,
    "path": "string",
    "method": "string",
    "description": "string",
    "active": true,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
]
```

### Create API Route

```
POST /api-routes
```

Request body:
```json
{
  "path": "string",
  "method": "string",
  "description": "string",
  "active": true
}
```

## Service Metrics

### Get Service Metrics

```
GET /service-metrics
```

Response:
```json
[
  {
    "id": 1,
    "serviceName": "string",
    "metricName": "string",
    "metricValue": 100,
    "timestamp": "timestamp"
  }
]
```

### Create Service Metric

```
POST /service-metrics
```

Request body:
```json
{
  "serviceName": "string",
  "metricName": "string",
  "metricValue": 100
}
```

## Status Endpoint

### Get API Status

```
GET /status
```

Response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "timestamp",
  "database": {
    "connected": true
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "Bad Request",
  "message": "Invalid input data",
  "details": {
    "field": "error description"
  }
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```