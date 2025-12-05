# API Routes Documentation

Complete reference of all available API endpoints.

## Alarms

- **Router**: [`routeAlarm.ts`](../src/routes/routeAlarm.ts)
- **Endpoints**:
  - `POST /api/alarm/set` - Set an alarm

## Authentication

- **Router**: [`routeAuth.ts`](../src/routes/routeAuth.ts)
- **Endpoints**:
  - `POST /api/auth/login` - User login
  - `POST /api/auth/register` - User registration

## Balance and Portfolio

- **Router**: [`routeBalance.ts`](../src/routes/routeBalance.ts)
- **Endpoints**:
  - `GET /api/balance/get` - Get account balance
  - `GET /api/balance/update/:platform` - Update balance for a specific platform

## Market Data and CMC

- **Routers**: [`routeCmc.ts`](../src/routes/routeCmc.ts), [`routeMarket.ts`](../src/routes/routeMarket.ts), [`routeTicker.ts`](../src/routes/routeTicker.ts)
- **Endpoints**:
  - `GET /api/cmc/get` - Get CMC data
  - `GET /api/cmc/update` - Update CMC data
  - `GET /api/market/get` - Get market data
  - `GET /api/tickers/get` - Get all tickers
  - `GET /api/tickers/update` - Update all tickers

## API Configuration Management

- **Router**: [`routeConfigApi.ts`](../src/routes/routeConfigApi.ts)
- **Endpoints**:
  - `GET /api/config/get` - Retrieve current API configuration
  - `POST /api/config/update` - Update API configuration
  - `POST /api/config/update/key` - Update an API key

## File Conversion

- **Router**: [`routeConverter.ts`](../src/routes/routeConverter.ts)
- **Endpoints**:
  - `POST /api/converter/post` - Convert a CSV file

## Dashboard Strategies

- **Router**: [`routeDashboard.ts`](../src/routes/routeDashboard.ts)
- **Endpoints**:
  - `GET /api/dashboard/get` - Retrieve Dashboard strategies
  - `POST /api/dashboard/trailing` - Manage a trailing stop hedge

## Trading Orders

- **Router**: [`routeOrder.ts`](../src/routes/routeOrder.ts)
- **Endpoints**:
  - `GET /api/orders/get` - Get active orders
  - `GET /api/orders/update/:platform` - Update orders for a specific platform
  - `POST /api/orders/cancel` - Cancel a specific order
  - `POST /api/orders/cancel/all` - Cancel all orders
  - `POST /api/orders/cancel/all/sell` - Cancel all sell orders
  - `POST /api/orders/cancel/all/buy` - Cancel all buy orders
  - `POST /api/orders/market-buy-order` - Create a market buy order
  - `POST /api/orders/market-sell-order` - Create a market sell order
  - `POST /api/orders/limit-buy-order` - Create a limit buy order
  - `POST /api/orders/limit-sell-order` - Create a limit sell order

## RSS Feeds

- **Router**: [`routeRss.ts`](../src/routes/routeRss.ts)
- **Endpoints**:
  - `GET /api/rss/get` - Retrieve RSS feeds
  - `POST /api/rss/add` - Add a new RSS feed
  - `DELETE /api/rss/delete/:id` - Delete an RSS feed

## Trading Strategies

- **Router**: [`routeStrategy.ts`](../src/routes/routeStrategy.ts)
- **Endpoints**:
  - `GET /api/strategy/get` - Retrieve all trading strategies
  - `POST /api/strategy/update` - Update an existing strategy
  - `POST /api/strategy/updateById` - Update a specific strategy by ID
  - `POST /api/strategy/updateByIds` - Update multiple strategies by their IDs
  - `DELETE /api/strategy/delete/:id` - Delete a specific strategy by ID

## Timestamp Management

- **Router**: [`routeTimestamp.ts`](../src/routes/routeTimestamp.ts)
- **Endpoints**:
  - `GET /api/timestamp/get` - Get the last global update
  - `GET /api/timestamp/get/:type/:platform` - Get a specific update
  - `GET /api/timestamp/update/:type` - Update specific information

## Trade History

- **Router**: [`routeTrade.ts`](../src/routes/routeTrade.ts)
- **Endpoints**:
  - `GET /api/trades/get` - Get historical trades
  - `POST /api/trades/add` - Manually add trades
  - `GET /api/trades/fetch/:platform/:base` - Fetch the latest trades for a specific base
  - `GET /api/trades/update/:platform` - Update trades for a platform

## WebSocket

- **Router**: [`routeWs.ts`](../src/routes/routeWs.ts)
- **Endpoints**:
  - `GET /api/ws/connect` - Establish a WebSocket connection
  - `POST /api/ws/send` - Send a message via WebSocket
  - `GET /api/ws/status` - Check WebSocket connection status

---

For detailed request/response examples, see the [complete API documentation](../../docs/API.md).
