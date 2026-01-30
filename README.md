# 📊 machi01_shad - Cryptocurrency Trading Platform

![Version](https://img.shields.io/badge/version-1.1.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Vue.js](https://img.shields.io/badge/Vue.js-3.5-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-14+-green)

> Full-stack cryptocurrency trading platform with modern interface and robust API

## 🎯 Overview

machi01_shad is a comprehensive full-stack cryptocurrency trading application that enables order management, real-time market data visualization, and automated trading strategy execution. The project is structured as a monorepo, combining a modern Vue.js frontend with a performant Node.js backend.

### ✨ Key Features

- 🚀 **Order Management** - Create, modify, and track trading orders
- 📊 **Real-time Data** - Live market and price visualization
- 🤖 **Automated Strategies** - Programmable trading algorithms
- 📈 **Market Analysis** - Technical and fundamental analysis tools
- ⏱️ **Alert System** - Custom price movement notifications
- 🔒 **Enhanced Security** - Secure authentication and API key encryption
- 🔗 **Multi-Exchange** - Integration with Binance and other exchanges via CCXT

## 📁 Project Structure

```
machi01_shad/
├── frontend/              # Vue.js 3 + TypeScript application
│   ├── src/
│   │   ├── components/    # Reusable Vue components
│   │   ├── composables/   # Composition API hooks
│   │   ├── services/      # API services and business logic
│   │   ├── store/         # State management with Pinia
│   │   ├── router.ts      # Route configuration
│   │   └── types/         # TypeScript definitions
│   └── package.json
│
├── backend/               # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── ctrl/          # Controllers (business logic)
│   │   ├── routes/        # API endpoint definitions
│   │   ├── services/      # Services (trading, market data, etc.)
│   │   ├── repo/          # Repositories (data access)
│   │   ├── middlewares/   # Express middlewares
│   │   └── types/         # TypeScript definitions
│   └── package.json
│
└── README.md              # This file
```

## 🚀 Quick Start

### 🐳 Running with Docker (Recommended)

The easiest way to run the entire stack (MongoDB + Backend + Frontend) is using Docker Compose.

#### Production Mode
```bash
docker compose up -d
```
- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **Backend API**: [http://localhost:4001/api](http://localhost:4001/api)
- **MongoDB**: `localhost:27001`

#### Development Mode
```bash
docker compose -f docker-compose.dev.yml up -d
```

### 💻 Local Development

#### Prerequisites
- **Node.js** >= 20.x
- **PNPM** >= 10.x
- **MongoDB** (Local or Docker)

#### Installation & Launch
```bash
# Install everything from root
pnpm install

# Build everything
pnpm build

# Launch everything in dev mode
pnpm dev
```

## 🛠️ Tech Stack

- **Frontend**: Vue.js 3.5, PrimeVue, Pinia, Vite
- **Backend**: Node.js, Express, TypeScript, CCXT (Trading), MongoDB
- **Infrastructure**: Docker, Nginx (Frontend server)

## 📁 Project Structure

```
machi01_shad/
├── apps/
│   ├── frontend/     # Vue.js Web interface (Vite)
│   └── backend/      # Node.js Trading API
├── docker-compose.yml
├── package.json      # Workspace root
└── pnpm-workspace.yaml
```

*Note: The project uses a PNPM monorepo structure.*

## 📚 Documentation

- [⚙️ Backend API](./backend/README.md)
- [📱 Frontend UI](./frontend/README.md)
- [🏗️ Master Architecture](../machi00_ops/MASTER_CONTEXT.md)

## 🏗️ Architecture

### Frontend

The frontend application follows a modular architecture based on Vue 3's Composition API:

- **Composables** for reusable logic
- **Pinia stores** for centralized state management
- **Services** for API calls
- **TypeScript types** for type safety

### Backend

The backend follows a layered architecture (MVC):

- **Routes** → **Controllers** → **Services** → **Repositories**
- Clear separation of concerns
- Reusable business services
- Centralized error handling

## 🧪 Testing

```bash
# Frontend tests
cd frontend
yarn test

# Backend tests
cd backend
yarn test
```

## 📦 Production Build

```bash
# Build frontend
cd frontend
pnpm build

# Build backend
cd backend
pnpm build
```

## 🔒 Security

- ✅ Password hashing with bcrypt
- ✅ CSRF and XSS protection via Helmet
- ✅ User input validation
- ✅ API key encryption
- ✅ Environment variables for secrets
- ✅ Restrictive CORS configuration

## 📊 Project History

This monorepo was created by merging two separate repositories while **preserving the complete Git history**:

- **Frontend**: [machi-shad-frontend](https://github.com/machichiotte/machi-shad-frontend) - 494 commits
- **Backend**: [machi-shad-backend](https://github.com/machichiotte/machi-shad-backend) - 390 commits

**Total: 887 commits preserved** 🎉

## 🗺️ Roadmap

- [ ] WebSocket integration for real-time data
- [ ] Support for new exchanges (Kraken, Coinbase)
- [ ] Advanced analytics dashboard with interactive charts
- [ ] Mobile application (React Native)
- [ ] Backtesting mode for strategies
- [ ] Push notification system
- [ ] Public API documented with Swagger

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👤 Author

**Machi Chiotte**

- GitHub: [@machichiotte](https://github.com/machichiotte)
- Email: [machichiotte@gmail.com](mailto:machichiotte@gmail.com)

## 🙏 Acknowledgments

- [CCXT](https://github.com/ccxt/ccxt) for exchange integration
- [Vue.js](https://vuejs.org/) and [PrimeVue](https://primevue.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework

---

⭐ If you like this project, don't hesitate to give it a star!
