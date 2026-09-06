# Urban Furniture Accounting System 
# Modura Ledger 

A comprehensive web-based accounting and inventory management system tailored for the Urban Furniture business. This application manages master data (accounts, items, parties, godowns, etc.), transactions (sales, purchases, journals, receipts, payments), and generates essential accounting reports.

## Features

*   **Master Data Management**: Manage Accounts, Items, Account Groups, Item Groups, Parties, and Godowns.
*   **Transaction Processing**: Record Sales, Purchases, Receipts, Payments, and General Journal entries.
*   **Inventory Tracking**: Track item quantities across different godowns with batch/serial number support.
*   **Financial Reporting**: Generate Ledger accounts, Trial Balance, Profit & Loss statements, and Balance Sheets.
*   **User Access Control**: Role-based authentication and authorization (Admin, Accountant, User).
*   **Responsive UI**: Modern, accessible user interface built with React and Tailwind CSS.

## Tech Stack

### Frontend
*   React (with TypeScript)
*   Vite
*   Tailwind CSS
*   Lucide Icons (for UI icons)
*   React Router (for navigation)
*   Axios (for API communication)

### Backend
*   Node.js
*   Express.js
*   PostgreSQL (Database)
*   Prisma (ORM)
*   JWT (Authentication)
*   Bcrypt (Password Hashing)

## Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   PostgreSQL

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Urban_Furniture_Accounting_System
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
    *   Create a `.env` file in the `backend` directory with your PostgreSQL connection string and a JWT secret:
        ```env
        PORT=5000
        DATABASE_URL="postgresql://user:password@localhost:5432/urban_furniture?schema=public"
        JWT_SECRET="your_jwt_secret_key"
        ```
    *   Run database migrations and seed (if applicable):
        ```bash
        npx prisma migrate dev
        node seed.js
        ```
    *   Start the backend server:
        ```bash
        npm run dev
        ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```
    *   Create a `.env` file in the `frontend` directory (if different from default):
        ```env
        VITE_API_URL=http://localhost:5000/api
        ```
    *   Start the frontend development server:
        ```bash
        npm run dev
        ```

4.  **Access the Application:**
    Open your browser and navigate to `http://localhost:3000`.

## Project Structure

```text
Urban_Furniture_Accounting_System/
├── backend/               # Node.js/Express backend
│   ├── prisma/            # Prisma schema and migrations
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth and error middleware
│   │   ├── routes/        # API route definitions
│   │   └── index.js       # Server entry point
│   └── package.json
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (Dashboard, Master Data, etc.)
│   │   ├── context/       # React Context (Auth)
│   │   ├── App.tsx        # Main application component
│   │   └── main.tsx       # Entry point
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## Contributors

Jaini Patel
Vanshi Shah
Odoo Hackathon- 2026