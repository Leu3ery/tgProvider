# 📨 TgProvider Backend

TgProvider is a custom backend for the Telegram Mini App that enables users to purchase Telegram Stars (internal currency) at a 30% discount using TON cryptocurrency.

The project consists of:

**Backend** – handles authentication, user management, cryptocurrency transactions, and Telegram Stars purchasing.

**Frontend** – Angular-based web application that works as a Telegram Mini App.

## 🚀 Tech Stack

- **Node.js + Express.js** – REST API
- **TypeScript** – type safety and code reliability
- **PostgreSQL** – database
- **TypeORM** – ORM for database management
- **Telegram Mini App API** – integration with Telegram for automatic user registration
- **TON Blockchain** – cryptocurrency payments (TON)
- **JWT** – authentication
- **Express Rate Limit** – API rate limiting
- **CORS** – cross-origin resource sharing
- **Git/GitHub** – version control

## ⚙️ Local Setup

### 1. Clone the repositories

```bash
git clone https://github.com/Leu3ery/tgProvider.git
git clone https://github.com/Leu3ery/tgProviderFront.git
```

### 2. Install dependencies

```bash
cd tgProvider
npm install

cd ../tgProviderFront
npm install
```

### 3. Create `.env` file

Create a `.env` file in the **tgProvider** root directory with the following variables:

```ini
PORT=3000
JWT_SECRET=jwt_secret

# PostgreSQL Configuration
POSGRE_HOST=localhost
POSGRE_USERNAME=postgres
POSGRE_PASSWORD=your_password
POSGRE_DB=tgProvider

# Telegram Bot Configuration
BOT_SECRET=your_telegram_bot_secret

# TON Blockchain Configuration
TON_ACCOUNT=your_ton_wallet_address
TONCENTER_API_KEY=your_toncenter_api_key
MNEMONIC=your_wallet_mnemonic_phrase

# Transaction Configuration
TRANSACTIONS_LIFETIME=5 # minutes
COMISION_PERCENT=1.1

# TONNEL Configuration (for payment processing)
TONNEL_COOKIE=your_tonnel_cookie
TONNEL_HASH=your_tonnel_hash

# CORS Configuration
DOMEN=*
```

### 4. Setup PostgreSQL Database

Make sure PostgreSQL is installed and running. Create a database:

```sql
CREATE DATABASE tgProvider;
```

### 5. Run the server

Compile TypeScript and start the server:

```bash
cd tgProvider
npx tsc
node dist/server.js
```

Or in development mode (with auto-recompilation):

```bash
# Install ts-node-dev globally (optional)
npm install -g ts-node-dev

# Run with auto-reload
ts-node-dev --respawn --transpile-only src/server.ts
```

The server will start on `http://localhost:3000` by default (or the port specified in your `.env` file).

## 🔑 Key Features

- **Telegram Mini App Integration**: Automatic user registration through Telegram data
- **TON Cryptocurrency Payments**: Secure payment processing using TON blockchain
- **Telegram Stars Purchase**: Buy Telegram Stars at 30% discount
- **Transaction Management**: Automatic transaction verification and processing
- **User Authentication**: JWT-based authentication system
- **Rate Limiting**: Protection against API abuse

## 📁 Project Structure

```
tgProvider/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── transactionsChecker.ts # Transaction verification service
│   ├── config/
│   │   ├── config.ts          # Environment configuration
│   │   └── db.ts              # Database connection
│   ├── modules/
│   │   ├── users/             # User management module
│   │   ├── transacations/     # Transaction module
│   │   └── stars/             # Telegram Stars module
│   └── common/
│       ├── middelwares/       # Custom middlewares
│       └── utils/             # Utility functions
├── dist/                      # Compiled JavaScript output
└── package.json
```

## 🔗 Related Repositories

- **Frontend**: [tgProviderFront](https://github.com/Leu3ery/tgProviderFront) - Angular-based Telegram Mini App frontend

## 📝 API Endpoints

- `/api/users` - User management endpoints
- `/api/transactions` - Transaction endpoints
- `/api/stars` - Telegram Stars purchase endpoints

## 🔒 Security

- JWT token authentication for protected routes
- Rate limiting to prevent API abuse
- CORS configuration for secure cross-origin requests
- Secure transaction verification


