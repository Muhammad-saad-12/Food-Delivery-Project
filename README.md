# DineFlow – Advanced Restaurant & Food Delivery Management System

[![Node.js Version](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)](https://www.mongodb.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io)](https://socket.io)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Executive Summary

**DineFlow** is an enterprise-grade, full-stack multi-portal restaurant operations and on-demand food delivery platform built with the **MERN** stack (MongoDB, Express.js, React 18, Node.js) and TypeScript. 

DineFlow seamlessly bridges four critical stakeholders in modern food service:
1. **Customers** – Personalized restaurant discovery, granular dish customization, localized checkout with interactive Leaflet map geocoding, AI-powered menu recommendations, and real-time delivery GPS tracking.
2. **Restaurant Vendors** – Operational kitchen management, incoming live order Kanban streams with synthesized audio chimes, operating schedules, and an intelligent **AI Menu Item & Tag Generator** powered by the Google Gemini API.
3. **Delivery Riders** – Real-time order dispatch feed, turn-by-turn road routing via the Open Source Routing Machine (OSRM), live GPS beacon tracking broadcast over WebSockets, and COD cash reconciliation.
4. **System Administrators** – High-level executive analytics, partner restaurant onboarding and compliance approvals, account and role-based access governance, and centralized customer support complaint queues.

### 🇵🇰 Engineered for the Pakistani Market
- **Localized Currency**: Standardized Pakistani Rupee (`PKR / Rs.`) pricing across menus, cart totals, delivery fees, and invoices.
- **Local Payment Simulations**: Cash on Delivery (COD), JazzCash mobile wallet, and EasyPaisa mobile wallet with simulated phone/OTP confirmation screens.
- **Tax Compliance & Invoices**: Itemized printable invoices featuring official 8% sales tax (PRA / SRB / FBR standard rates).
- **Metro Focus**: Pre-seeded with authentic restaurants and culinary dishes across **Islamabad**, **Lahore**, and **Karachi** (e.g., *Kolachi Restaurant*, *Butt Karahi & BBQ*, *Monal Islamabad*, *Haveli Restaurant*, and *Student Biryani*).

---

## 🏗️ Architecture & Tech Stack

```
                                  ┌───────────────────────────┐
                                  │   Vite + React 18 Client   │
                                  │  Tailwind 4 + Redux Persist│
                                  └─────────────┬─────────────┘
                                                │
                          HTTP / REST API       │       WebSocket (Bidirectional)
                         (Axios JSON Requests)  │      (Socket.IO Real-Time Events)
                                                ▼
                                  ┌───────────────────────────┐
                                  │  Node.js 20+ / Express 4   │
                                  │  TypeScript Modular API   │
                                  └──────┬─────────────┬──────┘
                                         │             │
                    Mongoose ODM (Schema)│             │ Third-Party Micro-Integrations
                                         ▼             ▼
                                  ┌─────────────┐  ┌───────────────────────────┐
                                  │   MongoDB 7 │  │ • Google Gemini API (AI)  │
                                  │ Database    │  │ • OSRM / Valhalla Routing │
                                  └─────────────┘  │ • OpenStreetMap / Leaflet │
                                                   │ • Cloudinary Image CDN    │
                                                   └───────────────────────────┘
```

### Frontend Architecture
- **Core Framework**: React 18.3 with TypeScript 5.5
- **Build Tool**: Vite 6 (ultra-fast Hot Module Replacement & Rollup production bundling)
- **Styling**: Tailwind CSS 4 (`@tailwindcss/vite` engine) with responsive mobile-first layouts
- **State Management**: Redux Toolkit (RTK) with `redux-persist` (local storage persistence for shopping cart & auth tokens)
- **UI Primitives**: Radix UI (`@radix-ui/react-dialog`) for accessible modal dialogs
- **Animations**: Framer Motion for smooth drawer transitions and alert banners
- **Mapping & Geocoding**: Leaflet & OpenStreetMap for interactive pin drop location selection and live rider tracking
- **Real-Time Client**: Socket.IO Client 4.8
- **Icons**: Lucide React

### Backend Architecture
- **Runtime & Framework**: Node.js 20+ LTS with Express.js 4 (written in strict TypeScript)
- **Database**: MongoDB 7.0 with Mongoose 8 ODM (typed schemas and indexes)
- **Real-Time Engine**: Socket.IO 4.8 (rooms configured for `kitchen`, `riders`, `admin`, and per-order tracking `order_<number>`)
- **Authentication & Security**: JSON Web Tokens (JWT), bcryptjs password hashing, Helmet HTTP headers, CORS whitelisting, and Express-Validator
- **AI Integrations**: Google Gemini API (`@google/genai` / `gemini-1.5-flash`) with fallback culinary expert rule-based engine
- **Media & Logistics**: Cloudinary asset integration, Open Source Routing Machine (OSRM) integration for road-based geometries

---

## 🌟 Core Features & Portals Breakdown

### 1. 🍽️ Customer Portal & Discovery
- **Restaurant Discovery**: Fast filtering by cuisine, dietary tags (*Halal, 100% Vegan, Gluten-Free*), price range tier, and dynamic sorting (*Rating, Fastest Delivery, Lowest Fee*).
- **Food Customization Modal**: Real-time selection of portion sizes (*Half KG / Full 1 KG, Single Plate / Family Handi*), authentic spice tuners (*Mild, Medium Desi Mirch, Extra Spicy Ghost Pepper*), and add-ons (*Roghni Naan, Raita, Shami Kebab*).
- **Persistent Shopping Cart**: Redux-backed drawer calculating dish totals, 8% PRA/GST tax, standard delivery fee (`Rs. 180`, free for orders over `Rs. 2,000`), and driver tips.
- **Localized Map Checkout**: Interactive Leaflet pin selector with auto reverse-geocoding, predefined Pakistani landmark selection, recipient phone verification, and payment options (**Cash on Delivery**, **JazzCash**, **EasyPaisa**).
- **Official Itemized Invoices**: Exportable plain-text and printable tax invoices generated on order confirmation with official FBR/PRA compliant breakdowns.
- **AI Dining Concierge**: Floating chat assistant (`AIChatWidget.tsx`) connected to backend AI proxies to answer dish inquiries, recommend budget meals (under Rs. 600), and guide dietary preferences.
- **Live GPS Tracking**: Real-time delivery modal displaying driver road routes, vehicle badges, and distance/ETA updates.

### 2. 👨‍🍳 Vendor Operations & Kitchen Hub
- **Live Kitchen Order Kanban**: Real-time incoming order stream powered by WebSockets. Includes an in-browser Web Audio API alert chime (no external MP3 assets needed) and stage-by-stage progression (*Placed -> Confirmed -> Cooking -> Handed to Rider -> Delivered*).
- **Live Gross Sales & Workload Tracker**: Live KPI metrics showing daily gross volume in PKR, active kitchen dishes, and completion counters.
- **AI Menu Item Copywriter**: Create and edit food items with one-click **AI Generation** (`POST /api/ai/generate-menu-item`). Leverages Gemini API to author rich descriptions, categorize dishes, select dietary badges, and formulate portion sizes with realistic PKR price deltas.
- **Vendor Settings**: Configure logo and cover banner URLs, official merchant contact details, weekly operating schedule with daily open/closed toggles, delivery radius fees, and minimum order limits.

### 3. 🛵 Rider Logistics & Fleet Portal
- **Online / Offline Toggle**: Shift status switch controlling whether the rider appears in active fleet dispatch queues.
- **Nearby Available Pool**: Live feed of unassigned orders ready for pickup across local restaurants with calculated payout earnings (`Delivery Fee + Customer Tip`).
- **One-Click Acceptance**: Direct assignment workflow locking orders to the rider and updating vendor and customer dashboards instantaneously.
- **Road Route Leaflet Map**: Turn-by-turn road route geometries retrieved via OSRM, complete with distance in kilometers, estimated duration in minutes, and major highway/arterial summaries.
- **Live GPS Beacon Simulation**: Interactive broadcaster broadcasting simulated vehicle coordinates via Socket.IO room channels directly to customer tracking maps.
- **COD Reconciliation**: Clear payment indicators distinguishing between digitally prepaid orders and cash-to-collect amounts.

### 4. 🛡️ System Administration & Governance
- **Executive Analytics**: Global dashboard tracking total platform sales in PKR, completed delivery volume, active partner restaurants, registered accounts, and fleet on-duty counts.
- **7-Day Revenue Trend Chart**: Visual CSS bar chart displaying daily gross platform volume across all metro hubs and average ticket size calculations.
- **Restaurant Compliance & Approvals**: Review pending merchant applicants, approve new restaurants, promote high-rated partners to the featured carousel, or suspend non-compliant vendors.
- **Centralized Support & Complaint Queues**: Multi-status ticketing queue (*Pending, Reviewed, Resolved*) with priority flags (*Urgent, High, Medium, Low*), sender metadata, staff audit notes, and customer resolution logging.
- **Account & Role Governance**: Provision new staff accounts, manage role permissions (*Executive Admin, Operations Manager, Kitchen Coordinator, Rider, Customer*), and toggle account suspensions.

---

## 📁 Workspace Architecture

```
Restaurant-management-system/
├── client/                     # Vite + React 18 + TypeScript Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI widgets
│   │   │   ├── chat/          # AIChatWidget (Floating AI concierge)
│   │   │   ├── customer/      # FoodCustomizationModal, CartDrawer, ReviewModal
│   │   │   └── support/       # SupportModal (Customer inquiry dialog)
│   │   ├── features/          # Portal Feature Modules
│   │   │   ├── admin/         # AdminDashboard (Analytics, Governance, Queues)
│   │   │   ├── customer/      # CustomerDiscovery, RestaurantDetail, CheckoutModal, InvoiceView
│   │   │   ├── rider/         # RiderPortal (Dispatch Feed, GPS Tracker, OSRM Map)
│   │   │   └── vendor/        # LiveOrders, MenuManagement, VendorSettings
│   │   ├── services/          # Axios API client, Socket.IO client, OSRM routing
│   │   ├── store/             # Redux Toolkit & Persist (cartSlice, authSlice)
│   │   ├── utils/             # Currency formatter (formatPKR)
│   │   ├── App.tsx            # Portal switcher & main view coordinator
│   │   └── main.tsx           # React entry point with Redux Provider & PersistGate
│   ├── .env.example           # Client baseline environment template
│   ├── package.json           # React 18, Vite, Tailwind CSS 4, Redux, Radix UI
│   └── vite.config.ts         # Vite configuration with Tailwind CSS plugin
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/            # MongoDB connection (db.ts) & Socket.IO server (socket.ts)
│   │   ├── middleware/        # JWT authMiddleware & role verification
│   │   ├── models/            # Mongoose Schemas (Restaurant, MenuItem, Order, User, Review, Support)
│   │   ├── routes/            # REST API Routes (auth, restaurants, menu, orders, reviews, ai, support, admin)
│   │   ├── utils/             # Database seed data with Pakistani metro restaurants & dishes
│   │   └── server.ts          # Express application & HTTP server bootstrap
│   ├── .env.example           # Server baseline environment template
│   ├── package.json           # Express 4, Mongoose, Socket.IO, Security packages
│   └── tsconfig.json          # NodeNext TypeScript compiler options
│
├── nginx/                      # Production Nginx reverse proxy configuration
│   └── default.conf           # SSL termination, API routing, and WebSocket upgrade proxy
├── scripts/                    # Deployment & operations automation
│   └── init-letsencrypt.sh    # Certbot SSL certificate bootstrap script
├── Dockerfile                  # Multi-stage production build for Node backend
├── docker-compose.yml          # Local development container orchestration (Node + MongoDB 7)
├── docker-compose.prod.yml     # Production orchestration (Nginx, Certbot, Node API, MongoDB)
├── DEPLOYMENT.md               # Complete AWS EC2 production deployment guide
├── .env.example                # Root environment template for local Docker Compose
├── .env.production.example     # Root environment template for production AWS deployment
└── package.json                # Root monorepo scripts for unified execution
```

---

## 🚀 Local Development Setup

Follow these steps to run the complete DineFlow ecosystem on your local machine.

### 1. Prerequisites
- **Node.js**: v20.x or higher installed (`node -v`)
- **npm**: v9.x or higher installed (`npm -v`)
- **MongoDB**: v6.x or v7.x running locally on port `27017` (OR use Docker)
- **Git**

---

### 2. Clone Repository & Install Dependencies
Clone the repository and install all dependencies across the root, server, and client:

```bash
# Clone the repository
git clone https://github.com/your-username/Restaurant-management-system.git
cd Restaurant-management-system

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root directory
cd ..
```

---

### 3. Configure Environment Variables

#### A. Server Environment (`server/.env`)
Create `server/.env` based on `server/.env.example`:

```bash
cp server/.env.example server/.env
```

Review or customize settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/restaurant_db
JWT_SECRET=supersecret_jwt_key_restaurant_system_change_me
CLIENT_ORIGIN=http://localhost:5173

# Optional: Add Google Gemini API Key for dynamic AI menu copywriting
GEMINI_API_KEY=your_gemini_api_key_here
```

#### B. Client Environment (`client/.env`)
Create `client/.env` based on `client/.env.example`:

```bash
cp client/.env.example client/.env
```

Settings:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

### 4. Running the Development Servers

You can launch both the backend API and frontend client simultaneously using root scripts:

```bash
# From the project root:

# Option A: Run both simultaneously in separate terminal tabs
# Terminal 1: Backend API (runs on http://localhost:5000)
npm run dev:server

# Terminal 2: Frontend Client (runs on http://localhost:5173)
npm run dev:client
```

> **Note on Initial Seed**: When the backend server starts for the first time, it automatically connects to MongoDB and seeds the database with authentic Pakistani metro restaurants (*Kolachi, Butt Karahi, Monal Islamabad, Haveli, Student Biryani*), authentic dishes, and sample reviews.

---

### 5. Running with Docker Compose (Local Development)

If you prefer not to install MongoDB locally, launch the entire application with Docker Compose:

```bash
# Create local root .env
cp .env.example .env

# Build and start services in the background
docker-compose up --build -d
```

- **Frontend Client**: Access via `http://localhost:5173` (or run client locally via `npm --prefix client run dev`)
- **Backend API**: `http://localhost:5000/api`
- **MongoDB Database**: Running on `localhost:27017` with persistent Docker volume `mongo_data`
- **Stop containers**: `docker-compose down`

---

## 🌐 Production Deployment (AWS EC2 & Docker)

DineFlow is production-ready for deployment on **AWS EC2** using Docker Compose, Nginx reverse proxy, and Let's Encrypt SSL.

```
       Internet / DNS (Route 53)
                  │
                  ▼ Ports 80 & 443
         ┌─────────────────┐
         │  AWS EC2 Host   │
         │  (Elastic IP)   │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Nginx Container │ ◄── SSL / TLS (Certbot Auto-Renewal)
         └────────┬────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ React Client  │   │ Express API   │
│ Static Assets │   │ & Socket.IO   │
└───────────────┘   └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   MongoDB 7   │
                    │ (Auth Enabled)│
                    └───────────────┘
```

### Quick Deployment Steps
For detailed step-by-step instructions, consult the complete guide in [`DEPLOYMENT.md`](file:///home/saad/Restaurant-management-system/DEPLOYMENT.md).

1. **Launch EC2 Instance**: Provision an Ubuntu 24.04 LTS `t3.medium` instance and attach an Elastic IP. Open ports `22` (SSH), `80` (HTTP), and `443` (HTTPS) in your Security Group.
2. **Point DNS**: Point your domain `A` record (e.g., `dineflow.example.com`) to your EC2 Elastic IP.
3. **Configure Production Variables**:
   ```bash
   cp .env.production.example .env.production
   nano .env.production
   ```
4. **Bootstrap Let's Encrypt SSL**:
   ```bash
   chmod +x scripts/init-letsencrypt.sh
   ./scripts/init-letsencrypt.sh
   ```
5. **Launch Production Stack**:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
   ```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---|
| `GET` | `/api/health` | Healthcheck and MongoDB connection state | No |
| `POST` | `/api/auth/register` | Register a new customer or vendor user | No |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT bearer token | No |
| `GET` | `/api/restaurants` | List restaurants (supports `search`, `cuisine`, `dietary`, `priceRange`, `sort`) | No |
| `GET` | `/api/restaurants/:id` | Get specific restaurant profile & menu grouped by category | No |
| `POST` | `/api/restaurants` | Register a new restaurant partner | Yes (Admin/Vendor) |
| `GET` | `/api/menu` | List menu items with optional category and search filters | No |
| `POST` | `/api/menu` | Create a new dish with portion sizes, add-ons, and spice levels | Yes (Vendor) |
| `PUT` | `/api/menu/:id` | Update an existing dish | Yes (Vendor) |
| `DELETE` | `/api/menu/:id` | Remove a dish from the menu | Yes (Vendor) |
| `POST` | `/api/orders` | Place a new customer order with delivery location & payment info | No |
| `GET` | `/api/orders` | List orders (filtered by customer, vendor, rider, or admin role) | No |
| `PATCH`| `/api/orders/:id/status`| Update order status progression in kitchen or delivery | No |
| `POST` | `/api/orders/:id/assign-rider`| Assign an on-duty rider to an order | No |
| `POST` | `/api/orders/:id/location` | Broadcast live rider GPS coordinates via WebSockets | No |
| `POST` | `/api/reviews` | Submit a dish rating and written customer review | No |
| `POST` | `/api/ai/chat` | AI concierge proxy for dietary inquiries and recommendations | No |
| `POST` | `/api/ai/generate-menu-item`| AI dish copywriter for descriptions, tags, and sizes | No |
| `POST` | `/api/support` | Submit a customer support inquiry or complaint | No |
| `GET` | `/api/admin/stats` | Executive metrics (total revenue in PKR, order pipeline) | Yes (Admin) |
| `GET` | `/api/admin/restaurants` | Governance listing of all partner restaurants & approval states | Yes (Admin) |
| `PATCH`| `/api/admin/restaurants/:id/status`| Approve, reactivate, or suspend restaurant partners | Yes (Admin) |

---

## 🖼️ User Interface & Screen Mockups

> *Placeholder: Add application screenshots and demo GIFs here.*

| Customer Portal | Vendor Kitchen Stream |
|:---:|:---:|
| ![Customer Discovery Placeholder](https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80) | ![Vendor Kitchen Placeholder](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80) |
| *Restaurant discovery, cuisine filters, & persistent cart* | *Real-time incoming orders with audio chimes & status progression* |

| Rider Dispatch & GPS Navigation | Executive Admin Dashboard |
|:---:|:---:|
| ![Rider Navigation Placeholder](https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=700&q=80) | ![Admin Dashboard Placeholder](https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80) |
| *Turn-by-turn OSRM road routing & live GPS beacon broadcasting* | *Executive revenue analytics, support queues, & governance* |

---

## 📄 License & Attribution

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for full details.

Built with ❤️ for culinary innovators, passionate chefs, and food lovers.
