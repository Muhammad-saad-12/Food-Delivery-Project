# Restaurant Management System (RMS)

A unified full-stack workspace featuring a React 18 + TypeScript frontend and a Node.js + Express backend with MongoDB and real-time Socket.IO communication.

---

## 📁 Workspace Architecture

```
Restaurant-management-system/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── chat/          # AIChatWidget (Floating AI concierge)
│   │   │   └── customer/      # FoodCustomizationModal & CartDrawer
│   │   ├── features/          # Customer portal feature views
│   │   │   └── customer/      # CustomerDiscovery, RestaurantDetail, CustomerNavbar
│   │   ├── store/             # Redux Toolkit & Persist (authSlice, cartSlice)
│   │   ├── services/          # Axios HTTP & Socket.IO client instances
│   │   ├── App.tsx            # Main layout rendering CustomerPortal
│   │   ├── index.css          # Tailwind CSS 4 theme imports
│   │   └── main.tsx           # React 18 root with Redux Provider & PersistGate
│   ├── .env.example           # Client baseline environment template
│   ├── .env                   # Client local environment configuration
│   ├── package.json           # React 18, Vite, Tailwind 4, Redux, Radix UI
│   ├── tsconfig.json          # TypeScript bundler configuration
│   └── vite.config.ts         # Vite configuration with @tailwindcss/vite
│
├── server/                     # Backend API & Socket Server
│   ├── src/
│   │   ├── config/            # Database (Mongoose) & Socket.IO setup
│   │   ├── middleware/        # JWT authentication middleware
│   │   ├── models/            # Mongoose schemas (Restaurant, MenuItem, User)
│   │   ├── routes/            # Express routes (Health, Auth, Restaurants, Menu, AI)
│   │   ├── utils/             # Seed data with realistic restaurants & menus
│   │   └── server.ts          # Express 4 + HTTP + Socket.IO server entry
│   ├── .env.example           # Server baseline environment template
│   ├── .env                   # Server local environment configuration
│   ├── package.json           # Express 4, Mongoose, Socket.IO, Security packages
│   └── tsconfig.json          # NodeNext TypeScript configuration
│
├── Dockerfile                  # Multi-stage production build for Node backend
├── docker-compose.yml          # Container orchestration (Node app + MongoDB 7)
├── .env.example                # Baseline template for Docker Compose
├── .dockerignore               # Docker build exclusions
├── .gitignore                  # Git tracking exclusions
└── package.json                # Root convenience scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **npm**: v9+
- **Docker & Docker Compose** (optional for containerized runtime)

### 2. Development Setup

#### Client (Frontend)
```bash
cd client
npm install
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

#### Server (Backend)
```bash
cd server
npm install
npm run dev
```
*Backend API runs at: `http://localhost:5000`*

#### Monorepo Root Shortcuts
```bash
# Start backend in development
npm run dev:server

# Start frontend in development
npm run dev:client

# Compile both builds
npm run build
```

---

## 🍽️ Customer Portal & Features

- **Discovery & Search**: Real-time restaurant search, cuisine filters (Italian, Japanese, Mexican, Vegan, Healthy), dietary badges (Vegetarian, 100% Vegan, Gluten-Free, Halal), price range ($ - $$$$), and multi-attribute sorting (Rating, Delivery Speed, Delivery Fee).
- **Categorized Menus**: Sticky category tab navigation with real-time dish filtering, dietary indicators, calorie display, and chef special badges.
- **Customization Modal**: Dynamic dish configuration with portion sizes, spice level tuning (Mild to Ghost Pepper), add-ons, and special kitchen instructions.
- **Redux Persisted Cart**: Calculates subtotal, 8.5% tax, delivery fee ($2.99, or FREE on orders $40+), tip selections, and grand total. Automatically saves across browser reloads.
- **AI Concierge**: Floating assistant powered by `/api/ai/chat` answering dietary compatibility questions, spice guidance, budget meals, and chef recommendations with direct one-click add to cart.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/restaurants` | List restaurants (supports `search`, `cuisine`, `dietary`, `priceRange`, `sort`) |
| `GET` | `/api/restaurants/:id` | Get restaurant info and menu grouped by category |
| `POST` | `/api/restaurants` | Create new restaurant |
| `GET` | `/api/menu` | List menu items with optional category and dietary filters |
| `GET` | `/api/menu/:id` | Get single menu item with sizes, spice levels, and add-ons |
| `POST` | `/api/menu` | Create a new menu item |
| `PUT` | `/api/menu/:id` | Update an existing menu item |
| `DELETE`| `/api/menu/:id` | Remove a menu item |
| `POST` | `/api/ai/chat` | AI concierge proxy for dietary recommendations & menu inquiries |
| `GET` | `/api/health` | Service health status and MongoDB connection monitor |

Run the Node backend and MongoDB service simultaneously via Docker Compose:

```bash
docker-compose up --build
```

- **Backend API**: `http://localhost:5000`
- **MongoDB**: `localhost:27017` (with health checks and persistent volume `mongo_data`)

---

## ⚙️ Environment Variables

### Client (`client/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend REST API endpoint | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.IO server connection URL | `http://localhost:5000` |

### Server (`server/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | API listening port | `5000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/restaurant_db` |
| `JWT_SECRET` | Secret key for JWT signing | `supersecret_jwt_key_restaurant_system_change_me` |
| `CLIENT_ORIGIN` | Allowed CORS origin for frontend | `http://localhost:5173` |
