# ⚙️ machi01_shad - Backend API

![Node.js](https://img.shields.io/badge/Node.js-14+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-6.3-green)
![Version](https://img.shields.io/badge/version-1.1.1-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> Robust and secure RESTful API for cryptocurrency trading management

## 🎯 Description

Node.js/TypeScript backend with Express.js, handling all business logic for the machi01_shad platform: trading orders, real-time market data, automated strategies, and multi-exchange integration via CCXT.

## ✨ Key Features

### 🚀 Trading

- **Order Management** - Create, modify, cancel orders (Market, Limit, Stop-Loss)
- **Automated Execution** - Programmable trading strategies
- **Multi-Exchange** - Support for Binance, Kraken, Coinbase via CCXT
- **Complete History** - Tracking of all transactions

### 📊 Market Data

- **Real-time Prices** - WebSocket for instant updates
- **Order Books** - Detailed order books
- **Historical Data** - OHLCV (Open, High, Low, Close, Volume)
- **Multi-source Aggregation** - CoinMarketCap, direct exchanges

### 🤖 Automation

- **Custom Strategies** - Configurable trading algorithms
- **Backtesting** - Testing on historical data
- **Smart Alerts** - Condition-based notifications
- **Scheduled Tasks** - Cron jobs for automatic updates

### 🔒 Security

- **JWT Authentication** - Secure tokens
- **API Key Encryption** - Credential protection
- **Rate Limiting** - Abuse protection
- **Input Validation** - Injection prevention
- **Helmet.js** - Protection against common vulnerabilities

## 🛠️ Tech Stack

### Core

- **Node.js** - JavaScript runtime
- **Express.js 4.18** - Minimalist web framework
- **TypeScript 5.5** - Static typing
- **MongoDB 6.3** - NoSQL database

### Trading & Market Data

- **CCXT 4.1** - Unified library for exchanges
- **WebSocket (ws 8.18)** - Real-time connections
- **node-cron 3.0** - Task scheduling

### Security

- **bcrypt 5.1** - Password hashing
- **Helmet 7.1** - HTTP header security
- **dotenv 16.3** - Environment variable management

### Utilities

- **Winston 3.3** - Advanced logging
- **Nodemailer 6.7** - Email sending
- **PapaParse 5.4** - CSV parsing
- **Cheerio 1.0** - Web scraping
- **RSS Parser 3.13** - RSS feed parsing

### Development

- **Jest 29.7** - Testing framework
- **Supertest 7.0** - API testing
- **ESLint 9.10** - Linting
- **Prettier 3.3** - Code formatting
- **ts-node 10.9** - Direct TypeScript execution

## 📁 Project Architecture

```
backend/
├── src/
│   ├── ctrl/                    # Controllers (business logic)
│   │   ├── authController.ts    # Authentication
│   │   ├── orderController.ts   # Order management
│   │   ├── marketController.ts  # Market data
│   │   └── strategyController.ts # Trading strategies
│   │
│   ├── routes/                  # Endpoint definitions
│   │   ├── authRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── marketRoutes.ts
│   │   └── strategyRoutes.ts
│   │
│   ├── services/                # Business services
│   │   ├── tradingService.ts    # Trading logic
│   │   ├── marketDataService.ts # Market data retrieval
│   │   ├── strategyService.ts   # Strategy execution
│   │   ├── notificationService.ts # Alerts and emails
│   │   └── cronService.ts       # Scheduled tasks
│   │
│   ├── repo/                    # Repositories (data access)
│   │   ├── orderRepository.ts
│   │   ├── userRepository.ts
│   │   └── marketRepository.ts
│   │
│   ├── middlewares/             # Express middlewares
│   │   ├── authMiddleware.ts    # JWT verification
│   │   ├── errorHandler.ts      # Error handling
│   │   └── validator.ts         # Data validation
│   │
│   ├── types/                   # TypeScript definitions
│   │   ├── Order.ts
│   │   ├── User.ts
│   │   ├── Market.ts
│   │   └── Strategy.ts
│   │
│   ├── utils/                   # Utilities
│   │   ├── logger.ts            # Winston configuration
│   │   ├── encryption.ts        # Encryption/decryption
│   │   └── validators.ts        # Validation functions
│   │
│   ├── constants/               # Constants
│   │   └── config.ts
│   │
│   ├── index.ts                 # Entry point
│   └── server.ts                # Express configuration
│
├── tests/                       # Tests
│   ├── unit/                    # Unit tests
│   └── integration/             # Integration tests
│
├── dist/                        # Compiled code (generated)
├── .env                         # Environment variables (not versioned)
├── .env.example                 # Configuration template
├── tsconfig.json                # TypeScript configuration
├── jest.config.ts               # Jest configuration
└── package.json                 # Dependencies and scripts
```

## 🚀 Installation and Setup

### Prerequisites

- **Node.js** >= 14.x
- **Yarn** >= 1.22.x
- **MongoDB** >= 4.x (local or cloud)
- **Git**

### Installation

```bash
# Clone repository (if not already done)
git clone https://github.com/machichiotte/machi01_shad.git
cd machi01_shad/backend

# Install dependencies
yarn install
```

### Configuration

Create a `.env` file at the root of the backend folder:

```env
# ===== SERVER =====
PORT=10000
NODE_ENV=development
OFFLINE_MODE=false

# ===== MONGODB =====
MONGODB_USER=your_username
MONGODB_PASSWORD=your_password
MONGODB_CLUSTER=cluster0.xxxxx.mongodb.net
MONGODB_DATABASE=machi00

# MongoDB Collections
MONGODB_COLLECTION_BALANCE=balances
MONGODB_COLLECTION_CMC=coinmarketcap
MONGODB_COLLECTION_TIMESTAMP=timestamps
MONGODB_COLLECTION_DASHBOARD=dashboard
MONGODB_COLLECTION_MARKET=markets
MONGODB_COLLECTION_ORDER=orders
MONGODB_COLLECTION_STRAT=strategies
MONGODB_COLLECTION_SWAP=swaps
MONGODB_COLLECTION_TRADE=trades
MONGODB_COLLECTION_TICKER=tickers
MONGODB_COLLECTION_USER=users
MONGODB_COLLECTION_HIGHEST_PRICE=highest_prices
MONGODB_COLLECTION_PRICE_BTC=btc_prices
MONGODB_COLLECTION_PRICE_ETH=eth_prices
MONGODB_COLLECTION_SERVER_CONFIG=server_config
MONGODB_COLLECTION_API_CONFIG=api_config
MONGODB_COLLECTION_ALARM=alarms

# ===== SECURITY =====
ENCRYPTION_KEY=your_32_character_encryption_key
JWT_SECRET=your_jwt_secret

# ===== API KEYS =====
# Binance
APIKEY_BINANCE=your_binance_api_key
SECRETKEY_BINANCE=your_binance_secret

# CoinMarketCap
APIKEY_CMC=your_coinmarketcap_key

# ===== EMAIL (optional) =====
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Development

```bash
# Start server in development mode (with hot reload)
yarn dev

# Server will be available at http://localhost:10000
```

### Production

```bash
# Compile TypeScript
yarn build

# Start server in production mode
yarn start:prod
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Create user account |
| POST   | `/api/auth/login`    | Login (returns JWT) |
| POST   | `/api/auth/logout`   | Logout              |
| GET    | `/api/auth/me`       | Get current user    |

### Orders

| Method | Endpoint          | Description     |
| ------ | ----------------- | --------------- |
| GET    | `/api/orders`     | List all orders |
| GET    | `/api/orders/:id` | Order details   |
| POST   | `/api/orders`     | Create order    |
| PUT    | `/api/orders/:id` | Modify order    |
| DELETE | `/api/orders/:id` | Cancel order    |

### Market

| Method | Endpoint                        | Description      |
| ------ | ------------------------------- | ---------------- |
| GET    | `/api/market/tickers`           | Current prices   |
| GET    | `/api/market/orderbook/:symbol` | Order book       |
| GET    | `/api/market/ohlcv/:symbol`     | Historical data  |
| GET    | `/api/market/balance`           | Account balances |

### Strategies

| Method | Endpoint                    | Description      |
| ------ | --------------------------- | ---------------- |
| GET    | `/api/strategies`           | List strategies  |
| GET    | `/api/strategies/:id`       | Strategy details |
| POST   | `/api/strategies`           | Create strategy  |
| PUT    | `/api/strategies/:id`       | Modify strategy  |
| DELETE | `/api/strategies/:id`       | Delete strategy  |
| POST   | `/api/strategies/:id/start` | Start strategy   |
| POST   | `/api/strategies/:id/stop`  | Stop strategy    |

### Alarms

| Method | Endpoint          | Description  |
| ------ | ----------------- | ------------ |
| GET    | `/api/alarms`     | List alarms  |
| POST   | `/api/alarms`     | Create alarm |
| DELETE | `/api/alarms/:id` | Delete alarm |

For complete documentation, see [./API.md](../API.md)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Get a token

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Use the token

Include the token in the `Authorization` header:

```bash
GET /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Testing

```bash
# Run all tests
yarn test

# Tests in watch mode
yarn test --watch

# Tests with coverage
yarn test --coverage

# Test specific file
yarn test orderController.test.ts
```

## 📊 Logging

The backend uses Winston for structured logging.

### Log Levels

- `error` - Critical errors
- `warn` - Warnings
- `info` - General information
- `http` - HTTP requests
- `debug` - Debug information

### Example

```typescript
import logger from '@/utils/logger'

logger.info('Order created', { orderId: '123', symbol: 'BTC/USDT' })
logger.error('Failed to execute order', { error: err.message })
```

### Log Files

- `logs/error.log` - Errors only
- `logs/combined.log` - All logs
- Console - In development

## 🔄 Scheduled Tasks (Cron Jobs)

The backend executes several automatic tasks:

| Task          | Frequency    | Description            |
| ------------- | ------------ | ---------------------- |
| Price updates | Every 30s    | Fetch latest prices    |
| Alarm checks  | Every minute | Check alert conditions |
| Log cleanup   | Daily (3am)  | Archive old logs       |
| DB backup     | Daily (4am)  | MongoDB backup         |
| CMC update    | Every 5min   | CoinMarketCap data     |

Configuration in `src/services/cronService.ts`

## 🚀 Deployment

See the complete [Deployment Guide](../DEPLOYMENT.md) for detailed instructions.

## 🔧 Available Scripts

| Script            | Description                      |
| ----------------- | -------------------------------- |
| `yarn dev`        | Start server in development mode |
| `yarn build`      | Compile TypeScript to JavaScript |
| `yarn start:prod` | Start server in production       |
| `yarn test`       | Run tests                        |
| `yarn lint`       | Check code with ESLint           |
| `yarn clean`      | Clean dist folder                |
| `yarn copy-files` | Copy config files                |

## 🛡️ Security

### Implemented Best Practices

- ✅ **bcrypt hashing** - Secure passwords (10 rounds)
- ✅ **Helmet.js** - HTTP header protection
- ✅ **Configured CORS** - Authorized origins only
- ✅ **Rate limiting** - Max 100 req/15min per IP
- ✅ **Joi validation** - All inputs validated
- ✅ **SQL Injection** - Parameterized queries
- ✅ **XSS Protection** - Data sanitization
- ✅ **Encrypted secrets** - API keys encrypted
- ✅ **HTTPS only** - In production
- ✅ **JWT expiration** - Tokens with TTL

## 🤝 Contributing

See the [main README](../README.md) for contribution guidelines.

## 📄 License

MIT - See the [LICENSE](../LICENSE) file for details.

## 👤 Author

**Machi Chiotte**

- GitHub: [@machichiotte](https://github.com/machichiotte)
- Email: [machichiotte@gmail.com](mailto:machichiotte@gmail.com)

---

[⬆ Back to main README](../README.md)
