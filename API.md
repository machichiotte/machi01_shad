# 📡 API Documentation

Complete REST API documentation for machi00_shad.

## 🌐 Base URL

```
Development: http://localhost:10000/api
Production:  https://api.machi00.com/api
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Get a Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Use the Token

Include the token in the `Authorization` header of all authenticated requests:

```http
GET /orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 👤 Authentication

### Registration

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login

See [Obtenir un token](#obtenir-un-token)

### Logout

```http
POST /auth/logout
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### User Profile

```http
GET /auth/me
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 📋 Ordres

### List All Orders

```http
GET /orders?status=open&limit=50&offset=0
Authorization: Bearer {token}
```

**Query Parameters:**

- `status` (optionnel) - Filter by status: `open`, `closed`, `cancelled`
- `symbol` (optionnel) - Filter by pair: `BTC/USDT`
- `limit` (optionnel) - Number of results (default: 50, max: 100)
- `offset` (optionnel) - Pagination (default: 0)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "symbol": "BTC/USDT",
      "type": "limit",
      "side": "buy",
      "amount": 0.01,
      "price": 45000,
      "status": "open",
      "filled": 0,
      "remaining": 0.01,
      "createdAt": "2024-12-05T10:00:00Z",
      "updatedAt": "2024-12-05T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

### Get an Order

```http
GET /orders/:id
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "symbol": "BTC/USDT",
    "type": "limit",
    "side": "buy",
    "amount": 0.01,
    "price": 45000,
    "status": "open",
    "filled": 0,
    "remaining": 0.01,
    "exchangeOrderId": "12345678",
    "exchange": "binance",
    "createdAt": "2024-12-05T10:00:00Z",
    "updatedAt": "2024-12-05T10:00:00Z"
  }
}
```

### Create an Order

```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "symbol": "BTC/USDT",
  "type": "limit",
  "side": "buy",
  "amount": 0.01,
  "price": 45000
}
```

**Body Parameters:**

- `symbol` (required) - Trading pair (ex: `BTC/USDT`)
- `type` (required) - Order type: `market`, `limit`, `stop-loss`
- `side` (required) - Side: `buy`, `sell`
- `amount` (required) - Amount to trade
- `price` (required pour limit) - Limit price

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "symbol": "BTC/USDT",
    "type": "limit",
    "side": "buy",
    "amount": 0.01,
    "price": 45000,
    "status": "open",
    "exchangeOrderId": "12345678",
    "createdAt": "2024-12-05T10:00:00Z"
  }
}
```

### Cancel an Order

```http
DELETE /orders/:id
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "status": "cancelled"
  }
}
```

---

## 📊 Marché

### Current Prices (Tickers)

```http
GET /market/tickers?symbols=BTC/USDT,ETH/USDT
Authorization: Bearer {token}
```

**Query Parameters:**

- `symbols` (optionnel) - Comma-separated list of pairs

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "symbol": "BTC/USDT",
      "last": 45000,
      "bid": 44995,
      "ask": 45005,
      "high": 46000,
      "low": 44000,
      "volume": 1234.56,
      "change": 2.5,
      "changePercent": 5.88,
      "timestamp": "2024-12-05T10:00:00Z"
    }
  ]
}
```

### Order Book

```http
GET /market/orderbook/:symbol?limit=20
Authorization: Bearer {token}
```

**Path Parameters:**

- `symbol` (required) - Trading pair (ex: `BTC/USDT`)

**Query Parameters:**

- `limit` (optionnel) - Number of levels (default: 20, max: 100)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "symbol": "BTC/USDT",
    "bids": [
      [44995, 0.5],
      [44990, 1.2],
      [44985, 0.8]
    ],
    "asks": [
      [45005, 0.6],
      [45010, 1.0],
      [45015, 0.9]
    ],
    "timestamp": "2024-12-05T10:00:00Z"
  }
}
```

### Historical Data (OHLCV)

```http
GET /market/ohlcv/:symbol?timeframe=1h&limit=100
Authorization: Bearer {token}
```

**Path Parameters:**

- `symbol` (required) - Trading pair

**Query Parameters:**

- `timeframe` (optionnel) - Timeframe: `1m`, `5m`, `15m`, `1h`, `4h`, `1d` (default: `1h`)
- `limit` (optionnel) - Number of candles (default: 100, max: 1000)
- `since` (optionnel) - Start timestamp

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "timestamp": 1701777600000,
      "open": 44500,
      "high": 45000,
      "low": 44000,
      "close": 44800,
      "volume": 123.45
    }
  ]
}
```

### Account Balances

```http
GET /market/balance
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "exchange": "binance",
    "balances": [
      {
        "currency": "BTC",
        "free": 0.5,
        "used": 0.1,
        "total": 0.6
      },
      {
        "currency": "USDT",
        "free": 10000,
        "used": 2000,
        "total": 12000
      }
    ],
    "timestamp": "2024-12-05T10:00:00Z"
  }
}
```

---

## 🤖 Stratégies

### List Strategies

```http
GET /strategies?status=active
Authorization: Bearer {token}
```

**Query Parameters:**

- `status` (optionnel) - Filter by status: `active`, `paused`, `stopped`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "DCA Bitcoin",
      "type": "dca",
      "status": "active",
      "config": {
        "symbol": "BTC/USDT",
        "interval": "1d",
        "amount": 100
      },
      "performance": {
        "totalProfit": 250.5,
        "winRate": 65.5,
        "trades": 45
      },
      "createdAt": "2024-11-01T10:00:00Z"
    }
  ]
}
```

### Create a Strategy

```http
POST /strategies
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "DCA Bitcoin",
  "type": "dca",
  "config": {
    "symbol": "BTC/USDT",
    "interval": "1d",
    "amount": 100
  }
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Strategy created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "DCA Bitcoin",
    "type": "dca",
    "status": "paused",
    "config": {
      "symbol": "BTC/USDT",
      "interval": "1d",
      "amount": 100
    },
    "createdAt": "2024-12-05T10:00:00Z"
  }
}
```

### Start a Strategy

```http
POST /strategies/:id/start
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Strategy started successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "status": "active"
  }
}
```

### Stop a Strategy

```http
POST /strategies/:id/stop
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Strategy stopped successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "status": "stopped"
  }
}
```

---

## ⏰ Alarmes

### List Alarms

```http
GET /alarms
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "symbol": "BTC/USDT",
      "condition": "price_above",
      "value": 50000,
      "active": true,
      "triggered": false,
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ]
}
```

### Create an Alarm

```http
POST /alarms
Authorization: Bearer {token}
Content-Type: application/json

{
  "symbol": "BTC/USDT",
  "condition": "price_above",
  "value": 50000,
  "notification": {
    "email": true,
    "push": false
  }
}
```

**Body Parameters:**

- `symbol` (required) - Trading pair
- `condition` (required) - Condition: `price_above`, `price_below`, `change_percent`
- `value` (required) - Trigger value
- `notification` (optionnel) - Notification methods

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Alarm created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "symbol": "BTC/USDT",
    "condition": "price_above",
    "value": 50000,
    "active": true,
    "createdAt": "2024-12-05T10:00:00Z"
  }
}
```

### Delete an Alarm

```http
DELETE /alarms/:id
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Alarm deleted successfully"
}
```

---

## ⚠️ Gestion des erreurs

The API uses standard HTTP codes and returns structured error messages.

### Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Unauthenticated
- `403 Forbidden` - Unauthorized
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation failed
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be greater than 0"
      }
    ]
  }
}
```

### Error Codes

- `VALIDATION_ERROR` - Validation error
- `AUTHENTICATION_ERROR` - Authentication error
- `AUTHORIZATION_ERROR` - Authorization error
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `EXCHANGE_ERROR` - Exchange error
- `INTERNAL_ERROR` - Internal error

---

## 🔄 Rate Limiting

The API applies rate limits to prevent abuse:

- **Authentication** : 5 requests / 15 minutes
- **General endpoints** : 100 requests / 15 minutes
- **Market data** : 200 requests / 15 minutes

Response headers include:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701777600
```

---

## 🔌 WebSocket (à venir)

WebSocket documentation for real-time data will be added soon.

---

## 📚 Ressources

- [Postman Collection](./postman/machi00-api.json) - Postman collection to test the API
- [OpenAPI Spec](./openapi.yaml) - OpenAPI 3.0 specification
- [Code Examples](./examples/) - Code examples in different languages

---

[⬆ Retour au README principal](../README.md)
