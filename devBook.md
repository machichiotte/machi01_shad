# Backend Development Book

## Project Structure Overview
The backend project consists of the following key directories and files:

### 1. Configuration Files
- **.env.dev**: Environment variables for the development environment.
- **.gitignore**: Specifies files and directories to be ignored by Git.
- **.prettierignore**: Files and directories to be ignored by Prettier.
- **.prettierrc**: Configuration file for Prettier.
- **eslint.config.mjs**: Configuration file for ESLint.
- **jest.config.ts**: Configuration file for Jest testing framework.
- **tsconfig.json**: TypeScript configuration file.

### 2. Source Code
- **src/**: Contains the main source code with various subdirectories:
  - **constants/**: Constant values used throughout the application.
  - **ctrl/**: Manages incoming requests and responses.
  - **middlewares/**: Middleware functions for request processing.
  - **repo/**: Data access and manipulation.
  - **routes/**: Route definitions for API endpoints.
  - **services/**: Business logic implementation.
  - **types/**: Type definitions for TypeScript.
  - **utils/**: Utility functions and classes.

### 3. repo
- **authRepository.ts**: User authentication data access.
- **balanceRepository.ts**: User balance operations.
- **cmcRepository.ts**: CoinMarketCap data access.
- **highPriceRepository.ts**: High price tracking.
- **machiRepository.ts**: Machi application data access.
- **marketRepository.ts**: Market data handling.
- **orderBalanceRepository.ts**: Order balance data access.
- **strategyRepository.ts**: Trading strategy data access.
- **tickerRepository.ts**: Ticker data access.
- **timestampRepository.ts**: Timestamp-related operations.
- **tradeRepository.ts**: Trade data access.
- **trailingStopRepository.ts**: Trailing stop data access.

### Task

1. **Task 1:**
   - [ ] Subtask 1.
   - [ ] Subtask 2.
   - [ ] Subtask 3.
   - [ ] Subtask 4.

2. **Task 2:**
   - [x] Subtask 1.
   - [x] Subtask 2.
