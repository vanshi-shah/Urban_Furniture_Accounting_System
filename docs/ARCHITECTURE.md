# Architecture

## Urban Finance
*From transaction → accounting → insight.*

An intelligent accounting workflow for small businesses that doesn't just record financial activity — it explains its impact.

## System Layers

### 1. Master Data Layer (CRUD)
- Contacts, Products, Chart of Accounts, Journals, Budgets.

### 2. Transaction Layer
- Sales, Purchases, Invoices, Vendor Bills, Payments.

### 3. Accounting Engine Layer (Core)
- **Transaction → Accounting Event → Journal Entry**
- Generates double-entry ledgers for every business action.

### 4. Reporting Layer
- Real-time updates to P&L, Balance Sheet, Budget vs Actual.

### 5. Intelligence Layer (Differentiator)
- Rule-based financial intelligence on top of accounting data.
- Detects business risks (overdue receivables, budget limits).
- Provides insights and recommended actions.

## Division of Responsibilities (2-Member Team)

**Backend (Node/Express/Prisma/PostgreSQL)**
- Master Data APIs
- Transactions
- Double Entry Accounting Engine
- Tax calculation, payment status, financial alerts calculation

**Frontend (React)**
- UX/UI
- Dashboard, Masters, Sales, Purchases, Invoices, Reports
- Visualizing the Transaction → Accounting Impact
