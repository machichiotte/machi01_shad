# 🤝 Contributing Guide

Thank you for your interest in contributing to machi00_shad! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Process](#development-process)
- [Code Standards](#code-standards)
- [Commits and Messages](#commits-and-messages)
- [Pull Requests](#pull-requests)
- [Reporting Bugs](#reporting-bugs)
- [Proposing Features](#proposing-features)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our code of conduct:

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 How to Contribute

### 1. Fork the Project

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/machi00_shad.git
cd machi00_shad
```

### 3. Add the Original Repository as Remote

```bash
git remote add upstream https://github.com/machichiotte/machi00_shad.git
```

### 4. Create a Branch

```bash
git checkout -b feature/my-new-feature
```

### 5. Make Your Changes

Develop your feature or fix the bug.

### 6. Test Your Changes

```bash
# Frontend
cd frontend
yarn test
yarn lint

# Backend
cd backend
yarn test
yarn lint
```

### 7. Commit Your Changes

```bash
git add .
git commit -m "feat: add my new feature"
```

### 8. Push to Your Fork

```bash
git push origin feature/my-new-feature
```

### 9. Create a Pull Request

Go to GitHub and create a Pull Request from your branch to `main`.

## 🔄 Development Process

### Branch Structure

- `main` - Main branch (production)
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Git Workflow

1. Sync with upstream:

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. Create your branch from `develop`:

   ```bash
   git checkout develop
   git checkout -b feature/my-feature
   ```

3. Develop and test

4. Rebase if necessary:

   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

5. Create a Pull Request to `develop`

## 📝 Code Standards

### TypeScript

- Use TypeScript strict mode
- Define explicit types (avoid `any`)
- Use interfaces for complex objects
- Document public functions with JSDoc

```typescript
/**
 * Creates a new trading order
 * @param symbol - Trading pair (e.g., 'BTC/USDT')
 * @param type - Order type ('market' | 'limit')
 * @param side - Order side ('buy' | 'sell')
 * @param amount - Amount to trade
 * @returns The created order
 */
async function createOrder(
  symbol: string,
  type: OrderType,
  side: OrderSide,
  amount: number
): Promise<Order> {
  // Implementation
}
```

### Vue.js

- Use Composition API with `<script setup>`
- Components in PascalCase
- Typed props with TypeScript
- Emit typed events

```vue
<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  orderId: string;
  initialStatus?: OrderStatus;
}

const props = withDefaults(defineProps<Props>(), {
  initialStatus: "pending",
});

const emit = defineEmits<{
  update: [order: Order];
  delete: [orderId: string];
}>();
</script>
```

### Naming Conventions

| Type        | Convention              | Example                             |
| ----------- | ----------------------- | ----------------------------------- |
| Files       | camelCase or PascalCase | `orderService.ts`, `OrderCard.vue`  |
| Variables   | camelCase               | `orderList`, `isLoading`            |
| Constants   | UPPER_SNAKE_CASE        | `API_BASE_URL`, `MAX_RETRIES`       |
| Functions   | camelCase               | `fetchOrders()`, `calculateTotal()` |
| Classes     | PascalCase              | `OrderService`, `TradingStrategy`   |
| Interfaces  | PascalCase              | `Order`, `UserData`                 |
| Types       | PascalCase              | `OrderType`, `ApiResponse`          |
| Composables | camelCase with `use`    | `useOrders()`, `useAuth()`          |

### Formatting

The project uses Prettier for automatic formatting:

```bash
# Frontend
cd frontend
yarn format

# Backend
cd backend
yarn format
```

Prettier configuration (`.prettierrc`):

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Linting

ESLint is configured to maintain code quality:

```bash
# Check code
yarn lint

# Auto-fix
yarn lint --fix
```

## 💬 Commits and Messages

### Commit Format

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Commit Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Adding or modifying tests
- `chore` - Maintenance, dependencies, etc.
- `ci` - CI/CD changes
- `build` - Build system changes

### Examples

```bash
feat(orders): add support for stop-loss orders
fix(auth): correct JWT token validation
docs(readme): update installation instructions
refactor(market): simplify price fetching logic
test(orders): add tests for order creation
chore(deps): update Vue.js to 3.5
```

### Scope

The scope indicates which part of the project is affected:

- `orders` - Order management
- `market` - Market data
- `auth` - Authentication
- `strategy` - Trading strategies
- `ui` - User interface
- `api` - Backend API
- `db` - Database

## 🔍 Pull Requests

### Checklist Before Submitting

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Linting is OK
- [ ] Documentation is updated
- [ ] Commits follow Conventional Commits format
- [ ] PR has a clear description
- [ ] Changes are tested locally

### Pull Request Template

```markdown
## Description

Brief description of the changes made.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation

## How to Test?

1. Step 1
2. Step 2
3. Step 3

## Screenshots (if applicable)

Add screenshots to illustrate visual changes.

## Checklist

- [ ] My code follows the project standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in complex areas
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or my feature works
- [ ] Unit tests pass locally
```

### Review Process

1. A maintainer will review your PR
2. Changes may be requested
3. Make the requested modifications
4. Once approved, the PR will be merged

## 🐛 Reporting Bugs

### Before Reporting

1. Check that the bug hasn't already been reported
2. Make sure you're using the latest version
3. Collect debugging information

### Bug Report Template

Use the GitHub issue template for bug reports.

## 💡 Proposing Features

### Feature Request Template

Use the GitHub issue template for feature requests.

## 📚 Resources

- [Vue.js Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Express.js Documentation](https://expressjs.com/)
- [CCXT Guide](https://docs.ccxt.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## ❓ Questions

If you have questions, feel free to:

- Open an issue with the `question` label
- Contact [@machichiotte](https://github.com/machichiotte)
- Send an email to [machichiotte@gmail.com](mailto:machichiotte@gmail.com)

---

Thank you for contributing to machi00_shad! 🚀
