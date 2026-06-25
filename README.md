# Retail Inventory Tracker

![CI](https://github.com/LucasKnight34/retail-inventory-tracker/actions/workflows/ci.yml/badge.svg)

A full-stack inventory management system for a retail hardware store. Built to manage products, categories, and stock levels — with low-stock alerts, a live dashboard, and secure JWT authentication. The backend exposes a RESTful API built on Node.js and Express, backed by PostgreSQL using raw SQL queries throughout. The frontend is a React single-page application that communicates with the API and is deployed as a static site. The entire project is covered by an automated test suite running on GitHub Actions CI/CD.

---

## Live Demo

| | URL |
|---|---|
| Frontend | [https://rit-frontend.onrender.com](https://retail-inventory-tracker-1.onrender.com) |

> Note: Hosted on Render's free tier. The first request after a period of inactivity may take 30–60 seconds to wake up.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js 20 | JavaScript server runtime |
| Framework | Express.js | REST API routing and middleware |
| Database | PostgreSQL | Relational database with raw SQL queries |
| Auth | JWT + bcrypt | Token-based authentication, secure password hashing |
| Frontend | React + Vite | Component-based UI, fast dev server and build |
| HTTP Client | Axios | API requests from the frontend |
| Testing | Jest + Supertest | Unit and integration tests for the backend |
| CI/CD | GitHub Actions | Automated test runs on every push and pull request |
| Hosting | Render | Cloud deployment for both the API and static site |

---

## Features

- **Full CRUD** for products and categories via a RESTful API
- **JWT authentication** — register and login with bcrypt-hashed passwords; protected write endpoints
- **Search and filter** — search products by name (case-insensitive) and filter by category
- **Low-stock alerts** — configurable threshold per product; dashboard surfaces all items below threshold
- **Inventory dashboard** — live stats including total product count, total inventory value, low-stock count, and out-of-stock count
- **Paginated product list** — supports `page` and `limit` query parameters
- **CI/CD pipeline** — GitHub Actions runs the full test suite against a PostgreSQL service container on every push

---

## Database Schema

```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  sku                 VARCHAR(100) UNIQUE NOT NULL,
  category_id         INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  price               DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  quantity            INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  description         TEXT,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_name     ON products(name);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku      ON products(sku);
```

---

## API Reference

### Auth

| Method | Path | Auth Required | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Create a new user account, returns JWT |
| POST | /api/auth/login | No | Login with email and password, returns JWT |
| GET | /api/auth/me | Yes | Returns the current authenticated user |

### Products

| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | /api/products | No | List all products. Supports `search`, `category_id`, `low_stock`, `page`, `limit` query params |
| GET | /api/products/stats/summary | No | Returns total count, total value, low-stock count, out-of-stock count |
| GET | /api/products/:id | No | Get a single product by ID |
| POST | /api/products | Yes | Create a new product |
| PUT | /api/products/:id | Yes | Update an existing product |
| DELETE | /api/products/:id | Yes | Delete a product |

### Categories

| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | /api/categories | No | List all categories with product count |
| GET | /api/categories/:id | No | Get a single category |
| POST | /api/categories | Yes | Create a new category |
| PUT | /api/categories/:id | Yes | Update a category |
| DELETE | /api/categories/:id | Yes | Delete a category (only if no products reference it) |

### Health

| Method | Path | Auth Required | Description |
|---|---|---|---|
| GET | /api/health | No | Returns server status and timestamp |

---

## Sample SQL Queries

### 1. JOIN — Get products with their category name
```sql
SELECT p.*, c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.created_at DESC;
```
Rather than making separate queries for products and categories, a single JOIN retrieves everything in one round trip. The `LEFT JOIN` ensures products without a category still appear.

---

### 2. ILIKE — Case-insensitive product search
```sql
SELECT p.*, c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.name ILIKE $1
ORDER BY p.name;
```
`ILIKE` is PostgreSQL's case-insensitive pattern match. The value passed for `$1` is `%search_term%`, so searching "lumber" matches "2x4 Lumber 8ft" regardless of casing.

---

### 3. Aggregate — Inventory stats summary
```sql
SELECT
  COUNT(*)                                                        AS total_products,
  COALESCE(SUM(price * quantity), 0)                             AS total_inventory_value,
  COUNT(*) FILTER (WHERE quantity < low_stock_threshold)         AS low_stock_count,
  COUNT(*) FILTER (WHERE quantity = 0)                           AS out_of_stock_count
FROM products;
```
A single query computes all four dashboard stats using `COUNT`, `SUM`, and conditional `FILTER` clauses — avoiding four separate queries.

---

### 4. Filter — Low-stock items only
```sql
SELECT p.*, c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.quantity < p.low_stock_threshold
ORDER BY p.quantity ASC;
```
Compares each product's current quantity against its own configurable threshold, so different products can have different alert levels.

---

### 5. Pagination — LIMIT and OFFSET
```sql
SELECT p.*, c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.created_at DESC
LIMIT $1 OFFSET $2;
```
`LIMIT` controls how many rows to return per page and `OFFSET` skips the rows from previous pages. For page 2 with a limit of 20: `LIMIT 20 OFFSET 20`.

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL (recommended: [Postgres.app](https://postgresapp.com) for Mac)

### Clone the repo
```bash
git clone https://github.com/LucasKnight34/retail-inventory-tracker.git
cd retail-inventory-tracker
```

### Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your local values:
```
PORT=3001
DATABASE_URL=postgresql://localhost/retail_inventory
JWT_SECRET=anylocalrandomstring
NODE_ENV=development
```

Create the database and run the schema:
```bash
createdb retail_inventory
psql retail_inventory -f src/db/schema.sql
psql retail_inventory -f src/db/seed.sql
```

Start the backend:
```bash
npm run dev
```
API is now running at `http://localhost:3001`.

### Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:3001
```

Start the frontend:
```bash
npm run dev
```
App is now running at `http://localhost:5173`.

---

## Running Tests

```bash
cd backend
npm test
```

The test suite uses Jest and Supertest. It spins up its own test database tables via `beforeAll`, runs all tests in band, and tears down after. The same suite runs automatically on GitHub Actions on every push.

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full step-by-step instructions to deploy to Render, including setting environment variables and running the schema against the production database.

---

## What I Learned

Most of my professional experience has been on the consumer-facing side, building the UI, making the API call, parsing the JSON, and displaying the data. At Ally I did that constantly, but the API itself was always someone else's work. Building the backend for this project was the part I enjoyed most because it closed that loop. I finally got to be on both sides of the contract I'd been coding against for years.
The SQL came back faster than expected. I hadn't written queries since college but the concepts weren't gone, it was more about relearning the syntax and terminology than relearning how to think about data. Writing raw queries instead of reaching for an ORM made that process more deliberate, and seeing a JOIN or aggregate actually return the right shape of data felt more satisfying than I anticipated.
The part that was most genuinely new to me was deployment. Almost every project I've built has lived on my local machine. Getting the backend, frontend, and database all running as separate services on Render, wiring them together with environment variables, handling SSL differences between local and production, debugging a CI pipeline that behaved differently than my local environment. That was a completely different skill set than writing the code itself. It's one thing to build something that works on your laptop. Making it work in the cloud is a different problem entirely, and this project was my first real experience solving it by myself.
