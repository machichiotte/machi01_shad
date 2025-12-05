# Project Structure

Complete directory tree of the backend project.

```
backend/
├── src/
│   ├── constants/              # Application constants
│   │   ├── coins.ts
│   │   ├── collection.ts
│   │   ├── metrics.ts
│   │   └── platform.ts
│   │
│   ├── ctrl/                   # Controllers (business logic)
│   │   ├── config/
│   │   │   └── ctrlConfigApi.ts
│   │   ├── ctrlAuth.ts
│   │   ├── ctrlBalance.ts
│   │   ├── ctrlCmc.ts
│   │   ├── ctrlConverter.ts
│   │   ├── ctrlDashboard.ts
│   │   ├── ctrlMarket.ts
│   │   ├── ctrlOrderBalance.ts
│   │   ├── ctrlOrderMarket.ts
│   │   ├── ctrlStrategy.ts
│   │   ├── ctrlTicker.ts
│   │   ├── ctrlTimestamp.ts
│   │   └── ctrlTrade.ts
│   │
│   ├── middlewares/            # Express middlewares
│   │   └── fileUploadMiddleware.ts
│   │
│   ├── repo/                   # Repositories (data access layer)
│   │   ├── config/
│   │   │   ├── repoConfigApi.ts
│   │   │   └── repoConfigServer.ts
│   │   ├── repoAuth.ts
│   │   ├── repoBalance.ts
│   │   ├── repoCmc.ts
│   │   ├── repoHighPrice.ts
│   │   ├── repoDashboard.ts
│   │   ├── repoMarket.ts
│   │   ├── repoOrderBalance.ts
│   │   ├── repoStrategy.ts
│   │   ├── repoTicker.ts
│   │   ├── repoTimestamp.ts
│   │   ├── repoTrade.ts
│   │   └── repoTrailingStop.ts
│   │
│   ├── routes/                 # API route definitions
│   │   ├── config/
│   │   │   └── routeApi.ts
│   │   ├── index.ts
│   │   ├── routeAuth.ts
│   │   ├── routeBalance.ts
│   │   ├── routeCmc.ts
│   │   ├── routeConverter.ts
│   │   ├── routeDashboard.ts
│   │   ├── routeMarket.ts
│   │   ├── routeOrder.ts
│   │   ├── routeStrategy.ts
│   │   ├── routeTicker.ts
│   │   ├── routeTimestamp.ts
│   │   └── routeTrade.ts
│   │
│   ├── services/               # Business services
│   │   ├── api/
│   │   │   ├── database/
│   │   │   │   ├── serviceDatabase.ts
│   │   │   │   ├── serviceMongodb.ts
│   │   │   │   ├── serviceMongodbOperations.ts
│   │   │   │   ├── serviceStrategy.ts
│   │   │   │   └── serviceTimestamp.ts
│   │   │   ├── platform/
│   │   │   │   ├── mappingPlatform.ts
│   │   │   │   ├── serviceBalance.ts
│   │   │   │   ├── serviceCcxt.ts
│   │   │   │   ├── serviceDashboard.ts
│   │   │   │   ├── serviceMarket.ts
│   │   │   │   ├── serviceOrderBalance.ts
│   │   │   │   ├── serviceOrderMarket.ts
│   │   │   │   ├── serviceSwap.ts
│   │   │   │   ├── serviceTicker.ts
│   │   │   │   └── serviceTrade.ts
│   │   │   └── serviceCmc.ts
│   │   ├── config/
│   │   │   ├── serviceConfigApi.ts
│   │   │   └── serviceConfigServer.ts
│   │   ├── cryptoAnalytics/
│   │   │   ├── indicator/
│   │   │   │   ├── bollingerBands.ts
│   │   │   │   ├── movingAverageCross.ts
│   │   │   │   └── rsi.ts
│   │   │   ├── invest/
│   │   │   │   ├── index.ts
│   │   │   │   ├── progressiveSell.ts
│   │   │   │   ├── shad.ts
│   │   │   │   ├── thresholdSell.ts
│   │   │   │   └── tieredSell.ts
│   │   │   ├── cmc.ts
│   │   │   ├── defaultAssets.ts
│   │   │   ├── tradeCalculations.ts
│   │   │   └── tradingUtils.ts
│   │   ├── update/
│   │   │   ├── updateManager.ts
│   │   │   ├── updateManagerGeneral.ts
│   │   │   └── updateManagerPlatform.ts
│   │   ├── serviceAuth.ts
│   │   ├── serviceCache.ts
│   │   ├── serviceConverter.ts
│   │   ├── serviceCron.ts
│   │   ├── serviceEmail.ts
│   │   ├── serviceProcessor.ts
│   │   └── serviceTrailingStop.ts
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── balance.ts
│   │   ├── cache.ts
│   │   ├── cmc.ts
│   │   ├── cron.ts
│   │   ├── cryptoAnalytics.ts
│   │   ├── database.ts
│   │   ├── email.ts
│   │   ├── express.d.ts
│   │   ├── market.ts
│   │   ├── mongodb.ts
│   │   ├── order.ts
│   │   ├── platform.ts
│   │   ├── routes.ts
│   │   ├── strat.ts
│   │   ├── ticker.ts
│   │   ├── timestamp.ts
│   │   ├── trade.ts
│   │   └── trailingStop.ts
│   │
│   ├── utils/                  # Utility functions
│   │   ├── cronUtil.ts
│   │   ├── encryption.ts
│   │   ├── errorUtil.ts
│   │   ├── loggerUtil.ts
│   │   ├── mappingUtil.ts
│   │   ├── metricsUtil.ts
│   │   ├── mockUtil.ts
│   │   ├── platformUtil.ts
│   │   ├── processorUtil.ts
│   │   ├── retryUtil.ts
│   │   └── timeUtil.ts
│   │
│   ├── index.ts                # Application entry point
│   └── server.ts               # Express server configuration
│
├── tests/                      # Test files
│   └── unit/
│       ├── ctrl/               # Controller tests
│       │   ├── ctrlAuth.test.ts
│       │   ├── ctrlBalance.test.ts
│       │   ├── ctrlCmc.test.ts
│       │   ├── ctrlConverter.test.ts
│       │   ├── ctrlDashboard.test.ts
│       │   ├── ctrlMarket.test.ts
│       │   ├── ctrlOrderBalance.test.ts
│       │   ├── ctrlOrderMarket.test.ts
│       │   ├── ctrlStrategy.test.ts
│       │   ├── ctrlTicker.test.ts
│       │   ├── ctrlTimestamp.test.ts
│       │   └── ctrlTrade.test.ts
│       ├── routes/             # Route tests
│       │   ├── dashboardRoutes.test.ts
│       │   ├── marketRoutes.test.ts
│       │   ├── orderRoutes.test.ts
│       │   ├── routeAuth.test.ts
│       │   ├── routeBalance.test.ts
│       │   ├── routeCmc.test.ts
│       │   ├── routeStrategy.test.ts
│       │   ├── routeTicker.test.ts
│       │   ├── routeTimestamp.test.ts
│       │   └── routeTrade.test.ts
│       └── services/           # Service tests
│           ├── bollingerBands.test.ts
│           ├── movingAverageCross.test.ts
│           ├── progressiveSell.test.ts
│           ├── rsi.test.ts
│           ├── thresholdSell.test.ts
│           └── tieredSell.test.ts
│
├── doc/                        # Documentation
│   ├── routes.md               # API routes reference
│   └── tree.md                 # This file
│
├── config/                     # Configuration files
│   ├── default.ts
│   ├── index.ts
│   └── types.ts
│
├── mockData/                   # Mock data for testing
│   └── json/
│       └── mongodb/            # MongoDB mock collections
│
├── .env                        # Environment variables (not versioned)
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── .prettierignore             # Prettier ignore rules
├── .prettierrc                 # Prettier configuration
├── eslint.config.mjs           # ESLint configuration
├── jest.config.ts              # Jest configuration
├── LICENSE                     # MIT License
├── package.json                # Dependencies and scripts
├── README.md                   # Project documentation
├── tsconfig.json               # TypeScript configuration
└── yarn.lock                   # Yarn lock file
```

## Architecture Overview

The backend follows a **layered architecture** (MVC pattern):

```
Request → Routes → Controllers → Services → Repositories → Database
```

### Layer Responsibilities

- **Routes**: Define API endpoints and HTTP methods
- **Controllers**: Handle request/response, orchestrate services
- **Services**: Implement business logic
- **Repositories**: Data access layer, interact with MongoDB
- **Utils**: Shared utility functions
- **Types**: TypeScript type definitions
- **Middlewares**: Request processing (auth, validation, etc.)

## Key Directories

### `/src/services/`

Contains all business logic organized by domain:

- **api/**: External API integrations (CCXT, MongoDB)
- **cryptoAnalytics/**: Trading indicators and strategies
- **update/**: Data update managers
- **config/**: Configuration services

### `/src/types/`

TypeScript definitions for:

- Domain models (Order, Trade, Strategy)
- API requests/responses
- Database schemas
- Service interfaces

### `/tests/`

Comprehensive test suite:

- Unit tests for controllers, routes, and services
- Test coverage for trading strategies
- Mock data for isolated testing

---

For more details, see the [main README](../README.md) and [Architecture documentation](../../ARCHITECTURE.md).
