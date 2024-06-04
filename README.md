# Machi GPT Shad Server

This project is the backend of the Machi GPT Shad application. It serves as the server-side logic for managing trading orders and market data.

## Description

The backend is built using Node.js and Express.js, along with other necessary libraries to handle HTTP requests, connect to MongoDB, and fetch data from external sources.

## Installation

1. Clone the repository from GitHub: `git clone https://github.com/your_username/backend.git`
2. Install dependencies: `npm install`

## Configuration

Before running the backend, make sure to set up the environment variables. Create a `.env` file in the root directory of the backend with the following content:

- MONGODB_URI=your_mongodb_connection_string
- CMC_APIKEY=your_coinmarketcap_api_key

Replace `your_mongodb_connection_string` with the actual connection string for your MongoDB database, and `your_coinmarketcap_api_key` with your API key for CoinMarketCap.

## Usage

To start the backend server, run the following command: `node server.js`

The server will start running on `http://localhost:3000`. The backend is now ready to handle incoming requests.

## API Endpoints

The backend exposes the following API endpoints:

### Get Market Data

- `GET /get/cmc`: Get market data from CoinMarketCap
- `GET /get/markets`: Get market data from exchanges using CCXT

### Trading Data

- `GET /get/balance`: Get account balance
- `GET /get/orders`: Get active trading orders
- `GET /get/strategy`: Get strategy data
- `GET /get/trades`: Get historical trades

### Update Data

- `GET /update/cmc`: Update market data from CoinMarketCap
- `GET /update/balance/:exchangeId`: Update account balance for a specific exchange
- `GET /update/orders/:exchangeId`: Update active trading orders for a specific exchange
- `POST /update/strategy`: Update strategy data
- `GET /update/trades/:exchangeId`: Update historical trades for a specific exchange
- `GET /update/markets/:exchangeId`: Update market data from exchanges using CCXT

### Cancel Orders

- `POST /cancel/order`: Cancel a specific order
- `POST /cancel/all-orders`: Cancel all open orders for a specific asset

### Create Bunch Orders

- `POST /bunch-limit-sell-orders`: Create multiple orders at once
- `POST /bunch-limit-buy-orders`: Create multiple orders at once

## Dependencies

The backend relies on the following Node.js packages:

- `body-parser`: Middleware for parsing incoming HTTP requests
- `ccxt`: Library for accessing cryptocurrency exchanges
- `cors`: Middleware for handling Cross-Origin Resource Sharing (CORS) issues
- `dotenv`: Library for loading environment variables from a `.env` file
- `express`: Web framework for handling HTTP requests and routes
- `fs`: File system module for reading and writing files
- `mongodb`: MongoDB driver for Node.js to connect and interact with a MongoDB database
- `node-fetch`: Library for making HTTP requests to external APIs

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Contact

If you have any questions or need further assistance, please feel free to contact us at [machichiotte@gmail.com](mailto:machichiotte@gmail.com).

