# 📱 machi01_shad - Frontend

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Vite](https://img.shields.io/badge/Vite-6.2-purple)
![PrimeVue](https://img.shields.io/badge/PrimeVue-3.48-blue)

> Modern and reactive user interface for the machi01_shad trading platform

## 🎯 Description

Full TypeScript web application built with Vue.js 3 and the Composition API, offering an intuitive interface for managing trading orders, visualizing real-time market data, and monitoring automated trading strategies.

## ✨ Features

### 📊 Order Management

- Real-time visualization of active orders
- Create and modify orders (Market, Limit, Stop-Loss)
- Complete transaction history
- Advanced filtering and search

### 📈 Market Analysis

- Interactive price charts
- Technical indicators (RSI, MACD, Bollinger Bands)
- Order books
- Multi-exchange market data

### 🤖 Trading Strategies

- Automated strategy configuration
- Historical data backtesting
- Performance monitoring
- Custom alerts

### ⚙️ Customizable Dashboard

- Drag & drop reorganizable widgets
- Dark/light theme
- Saved layouts
- Multiple views (Trading, Portfolio, Analytics)

## 🛠️ Tech Stack

### Core

- **Vue.js 3.5** - Progressive framework with Composition API
- **TypeScript 5.5** - Static typing for robustness
- **Vite 6.2** - Ultra-fast build tool with HMR

### UI/UX

- **PrimeVue 3.48** - Rich UI component library
- **PrimeIcons 7.0** - Vector icons
- **Swapy 1.0** - Drag & drop for customizable layouts
- **Vue SweetAlert2** - Elegant modals and notifications

### State Management & Routing

- **Pinia 3.0** - Modern and type-safe store
- **Vue Router 4.0** - Declarative routing

### Utilities

- **Lodash-ES 4.17** - Optimized JavaScript utilities
- **MongoDB 6.12** - Client for direct connections (if needed)

### Development

- **Vitest 2.1** - Fast testing framework
- **Vue Test Utils 2.4** - Testing utilities for Vue
- **ESLint** - Code linting
- **Prettier** - Automatic formatting

## 📁 Project Architecture

```
frontend/
├── src/
│   ├── components/          # Reusable Vue components
│   │   ├── Dashboard/       # Dashboard components
│   │   ├── Orders/          # Order management
│   │   ├── Market/          # Market data
│   │   ├── Strategy/        # Trading strategies
│   │   └── Common/          # Shared components
│   │
│   ├── composables/         # Composition API hooks
│   │   ├── useWebSocket.ts  # WebSocket connection
│   │   ├── useMarketData.ts # Market data
│   │   └── useAuth.ts       # Authentication
│   │
│   ├── store/               # Pinia stores
│   │   ├── auth.ts          # Authentication state
│   │   ├── orders.ts        # Order management
│   │   └── market.ts        # Market data
│   │
│   ├── services/            # API services
│   │   └── api.ts           # Centralized HTTP client
│   │
│   ├── types/               # TypeScript definitions
│   │   ├── Order.ts
│   │   ├── Market.ts
│   │   └── Strategy.ts
│   │
│   ├── utils/               # Utilities
│   │   ├── formatters.ts    # Data formatting
│   │   ├── validators.ts    # Validation
│   │   └── constants.ts     # Constants
│   │
│   ├── router.ts            # Route configuration
│   ├── main.ts              # Entry point
│   ├── App.vue              # Root component
│   └── style.css            # Global styles
│
├── public/                  # Static assets
├── tests/                   # Unit and e2e tests
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## 🚀 Installation and Setup

### Prerequisites

- Node.js >= 14.x
- Yarn >= 1.22.x

### Installation

```bash
# Install dependencies
pnpm install
```

### Configuration

Create a `.env` file at the root of the frontend folder:

```env
# Backend API URL
VITE_API_URL=http://localhost:10000

# WebSocket URL (optional)
VITE_WS_URL=ws://localhost:10000

# Development mode
VITE_DEV_MODE=true
```

### Development

```bash
# Start development server with HMR
pnpm dev

# Application will be available at http://localhost:5173
```

### Production Build

```bash
# Compile and minify for production
pnpm build

# Preview production build locally
pnpm preview
```

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Generate coverage report
pnpm test --coverage
```

## 🎨 Code Conventions

### Vue Component Structure

```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed, onMounted } from 'vue'
import type { Order } from '@/types/Order'

// 2. Props & Emits
interface Props {
  orderId: string
}
const props = defineProps<Props>()
const emit = defineEmits<{
  update: [order: Order]
}>()

// 3. Composables
const { fetchOrder } = useOrders()

// 4. State
const order = ref<Order | null>(null)

// 5. Computed
const isActive = computed(() => order.value?.status === 'active')

// 6. Methods
const loadOrder = async () => {
  order.value = await fetchOrder(props.orderId)
}

// 7. Lifecycle
onMounted(() => {
  loadOrder()
})
</script>

<template>
  <div class="order-card">
    <!-- Template -->
  </div>
</template>

<style scoped>
/* Component-scoped styles */
</style>
```

### Naming Conventions

- **Components**: PascalCase (`OrderCard.vue`)
- **Composables**: camelCase with `use` prefix (`useMarketData.ts`)
- **Types**: PascalCase (`Order.ts`, `interface OrderData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Variables/functions**: camelCase (`fetchOrders`, `isLoading`)

## 🔧 Available Scripts

| Script         | Description                        |
| -------------- | ---------------------------------- |
| `pnpm dev`     | Start development server with HMR  |
| `pnpm build`   | Compile application for production |
| `pnpm preview` | Preview production build           |
| `pnpm test`    | Run unit tests                     |
| `pnpm lint`    | Check and fix code with ESLint     |
| `pnpm format`  | Format code with Prettier          |
| `pnpm clean`   | Clean dist folder                  |

## 📊 Performance

### Implemented Optimizations

- ✅ **Code splitting** - Lazy loading of routes
- ✅ **Tree shaking** - Dead code elimination
- ✅ **Compression** - Gzip/Brotli for assets
- ✅ **Caching** - Service Worker for cache
- ✅ **Lazy loading** - Components loaded on demand
- ✅ **Debouncing** - For searches and filters
- ✅ **Virtual scrolling** - For long lists

### Target Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.0s
- **Lighthouse Score**: > 90

## 🔒 Security

- ✅ User input validation
- ✅ Data sanitization
- ✅ XSS protection via Vue.js
- ✅ JWT tokens for authentication
- ✅ HTTPS in production
- ✅ Content Security Policy (CSP)

## 🌐 Browser Compatibility

- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14
- Opera >= 76

## 📱 Responsive Design

The application is fully responsive and optimized for:

- 📱 Mobile (320px - 768px)
- 📱 Tablet (768px - 1024px)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1920px+)

## 🐛 Debugging

### Vue DevTools

Install the [Vue DevTools](https://devtools.vuejs.org/) extension to:

- Inspect components
- Debug Pinia store
- Analyze performance
- Trace events

### Development Logs

```typescript
// Enable detailed logs
if (import.meta.env.DEV) {
  console.log('Debug info:', data)
}
```

## 🚀 Deployment

### Build

```bash
pnpm build
```

The `dist/` folder will contain optimized files for production.

### Recommended Hosting

- **Netlify** - Integrated CI/CD
- **AWS S3 + CloudFront** - Maximum scalability
- **GitHub Pages** - Free for open source projects

### Production Environment Variables

```env
VITE_API_URL=https://api.machi00.com
VITE_WS_URL=wss://api.machi00.com
VITE_DEV_MODE=false
```

## 📚 Resources

- [Vue.js 3 Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [PrimeVue Documentation](https://primevue.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)

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
