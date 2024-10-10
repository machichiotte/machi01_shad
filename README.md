## Machi00 - Client

This project is the frontend part of the Machi00 client application. It is a web application that allows users to view and manage trading orders and market data.

### Key Features

- **Display orders**
- **Visualize market data**
- **Manage trading strategies**
- **Track transactions**

### Technologies Used

- **Vue.js**: JavaScript framework for building the user interface
- **Vue Router**: Managing application routes
- **Bootstrap**: CSS framework for layout and design
- **Bootstrap Vue**: Integrating Bootstrap with Vue.js
- **Path**: Manipulating file and directory paths
- **Portal Vue**: Managing rendering to another location in the DOM
- **Vue Router**: Managing routes for navigation
- **Popper.js Core**: Library for popups (tooltips and popovers)

### Project Setup

1. Clone the repository from GitHub: `git clone https://github.com/machichiotte/machi-gpt-shad.git`
2. Install dependencies: `npm install`
3. Launch the development server: `npm run serve`
4. Access the application in your browser: `http://localhost:8080`

### Contribution

Contributions are welcome! If you would like to contribute to this project, please create a pull request with your modifications.

### Authors

- [machichiotte](https://github.com/machichiotte)

### License

This project is licensed under the MIT License. See the [MIT License](https://www.mit.edu/~amini/LICENSE.md) file for more information.

### Notes

This project is still in development. Some features may not be fully implemented or may have bugs.

### Contact

If you have any questions or comments, feel free to contact us at [machichiotte@gmail.com](mailto:machichiotte@gmail.com).

```
machi-shad
├── .env
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc.json
├── .vscode
│  └── extensions.json
├── dist
│  ├── favicon.ico
│  ├── index.html
│  └── static
│    ├── index-CkK11q2p.css
│    ├── index-DzE6sxqm.js
│    ├── Inter-italic.var-DhD-tpjY.woff2
│    ├── Inter-roman.var-C-r5W2Hj.woff2
│    ├── primeicons-BubJZjaf.svg
│    ├── primeicons-CCFeZR6K.woff
│    ├── primeicons-Dk_eWBPK.eot
│    ├── primeicons-DsZ1W7-Z.woff2
│    └── primeicons-NDVQFXzF.ttf
├── index.html
├── jsconfig.json
├── package.json
├── public
│  └── favicon.ico
├── README.md
├── src
│  ├── App.vue
│  ├── assets
│  │  ├── base.css
│  │  ├── logo_exchange_binance.svg
│  │  ├── logo_exchange_gateio.svg
│  │  ├── logo_exchange_kucoin.svg
│  │  ├── logo_exchange_okx.svg
│  │  ├── logo_machi.svg
│  │  ├── logo.png
│  │  ├── logo.svg
│  │  └── style.css
│  ├── components
│  │  ├── buttons
│  │  │  ├── MyBunchSellButton.vue
│  │  │  ├── MyBuyButton.vue
│  │  │  └── MyEmergencySellButton.vue
│  │  ├── Cmc.vue
│  │  ├── forms
│  │  │  ├── AddBuyOrdersForm.vue
│  │  │  └── TradesForm.vue
│  │  ├── Home.vue
│  │  ├── Login.vue
│  │  ├── LogoMachi.vue
│  │  ├── orders
│  │  │  ├── Orders.vue
│  │  │  └── OrdersTable.vue
│  │  ├── PieChart.vue
│  │  ├── SelectPlatform.vue
│  │  ├── shad
│  │  │  ├── NextSellsTable.vue
│  │  │  ├── PercentageColumn.vue
│  │  │  ├── Machi.vue
│  │  │  ├── MachiDataTable.vue
│  │  ├── Signup.vue
│  │  ├── Strategy.vue
│  │  ├── Trades.vue
│  │  ├── TradesTable.vue
│  │  └── Update.vue
│  ├── js
│  │  ├── columns.js
│  │  ├── fetchFromServer.js
│  │  ├── indexedDB.js
│  │  ├── machi-shad client + server.code-workspace
│  │  ├── orders.js
│  │  ├── shad
│  │  │  ├── constants.js
│  │  │  └── shadUtils.js
│  │  ├── spinner.js
│  │  └── strategies.js
│  ├── json
│  │  └── platforms.json
│  ├── main.js
│  ├── router
│  │  ├── .htaccess
│  │  └── index.js
│  ├── services
│  │  ├── SignupValidations.js
│  │  └── Validations.js
│  └── store
│    ├── auth.js
│    ├── calcul.ts
│    ├── loading.js
├── vite.config.js
├── vitest.config.js
└── yarn.lock
```
