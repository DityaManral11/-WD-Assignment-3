# Inventory Management System

A backend-based Inventory Management System developed using **Node.js, Express.js, MongoDB, and Mongoose**. This project provides RESTful APIs to manage products, monitor inventory, adjust stock, and generate inventory reports.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JavaScript
- Postman

## Features

- Create new products
- Retrieve all products
- Search and filter products
- Sorting and pagination
- Get product by ID
- Update product details
- Delete products
- Adjust product stock
- Generate low-stock reports
- Category-wise inventory summary using MongoDB aggregation
- Input validation
- Centralized error handling

## Project Structure

```text
Inventory-Management-System/
│
├── config/
│   └── db.js
│
├── models/
│   └── Product.js
│
├── routes/
│   └── productRoutes.js
│
├── middleware/
│   ├── validateProduct.js
│   └── errorHandler.js
│
├── .env
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

## Installation and Setup

### 1. Open the project directory

```bash
cd C:\Users\Ditya\Inventory-Management-System
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/inventory_db
```

### 4. Start MongoDB

Make sure local MongoDB server is running.

### 5. Start the application

Development mode:

```bash
npm run dev
```

Normal mode:

```bash
npm start
```

Server runs at:

```text
http://localhost:3000
```

## API Endpoints

Base URL: `http://localhost:3000/api/products`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create a new product |
| GET | `/` | Get all products |
| GET | `/:id` | Get product by ID |
| PUT | `/:id` | Update product details |
| PATCH | `/:id/stock` | Adjust product stock |
| DELETE | `/:id` | Delete a product |
| GET | `/low-stock` | Get low-stock products |
| GET | `/summary` | Get category-wise summary |

## Product Schema

| Field | Description |
|---|---|
| name | Product name |
| sku | Unique product identifier |
| category | Product category |
| price | Product price |
| quantity | Available stock |
| reorderLevel | Minimum stock threshold |
| supplier | Supplier name |
| stockValue | Calculated stock value |

### Stock Value Calculation

```text
Stock Value = Price × Quantity
```

## Filtering, Sorting and Pagination

The GET all-products API supports:

- `category` – Filter products by category
- `search` – Search by name, SKU, or category
- `minPrice` – Minimum product price
- `maxPrice` – Maximum product price
- `sort` – Sort products
- `page` – Page number
- `limit` – Number of products per page

Example:

```text
GET /api/products?category=Electronics&page=1&limit=10
```

## Stock Adjustment

The PATCH stock API accepts a `change` value.

Example request:

```json
{
  "change": 10
}
```

- Positive value increases stock.
- Negative value decreases stock.
- Stock cannot be reduced below zero.

## Low Stock Report

The `/low-stock` endpoint identifies products where:

```text
quantity <= reorderLevel
```

## Category-wise Aggregation

The `/summary` endpoint provides:

- Total number of products
- Total quantity
- Total stock value
- Average product price

## Validation and Error Handling

- Required product fields are validated.
- SKU must be unique.
- Price and quantity cannot be negative.
- Reorder level cannot be negative.
- Invalid product IDs are handled.
- Missing products return appropriate error responses.
- Centralized error-handling middleware handles forwarded errors.

## API Testing

All API endpoints were tested using **Postman** with appropriate HTTP methods and JSON request bodies.

