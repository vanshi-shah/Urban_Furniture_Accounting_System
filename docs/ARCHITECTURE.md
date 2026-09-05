# Architecture

             React + Vite (Modura UI)
                   ↓
             REST API
                   ↓
             Node.js (Express)
                   ↓
                Prisma
                   ↓
              PostgreSQL

## Modura (Urban Furniture Accounting System)
*From transaction → accounting → insight.*

An intelligent accounting workflow and quiet luxury financial operating system for bespoke furniture ateliers that doesn't just record financial activity — it explains its impact.

## System Layers

### 0. Entry & Welcome Portal
- Animated Modura Welcome experience (`/welcome` and default unauthenticated `/`), 1-click Quick Demo logins, and secure JWT authentication.

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

## Component Architecture

- **Frontend Layout & Navigation**:
  - `DashboardLayout.tsx`: Zero-sidebar, full-width application shell with a sticky top navigation header (`Sales`, `Purchase`, `Account`, `Report`).
  - **Expandable Mega-Menu**: Multi-column popover overlay organized into the 4 architectural pillars, allowing single-click access to all modules without sidebar clutter.
  - **Wireframe Section Cards Architecture**: `Dashboard.tsx` mounts 3 primary operational controllers (`Sales`, `Purchase`, `Budget Reports`), each equipped with a header action pill, dual ambient lighting auras, and 3 tactile status tiles (`All`, `Confirmed`, `Draft` / `Achieved`, `Budget`, `Committed`) that link directly to filtered record views.
  - **Dual-Theme Icon Toggle**: High-performance icon toggle switching between light and dark themes smoothly.
  - **Connected Modules**: Master Data (`/contacts`, `/products`), Purchasing (`/purchase-orders`, `/vendor-bills`), Sales (`/sales-orders`, `/sales-invoices`, `/receipts`), Accounting (`/chart-of-accounts`, `/journals`, `/journal-entries`, `/budgets`, `/analytic-accounts`), and Reports (`/reports/balance-sheet`, `/reports/profit-and-loss`, `/reports/budget-report`, `/reports/trial-balance`).
  - **Journal Entries & Ledger Architecture**: Direct routing from Dashboard "Full Journal Ledger" to `/journal-entries`. Controller enriches ledger responses with relational lines (`account`, `contact`, `analyticAccount`), allowing frontend to render balanced double-entry ribbons (`DR: ... ⇄ CR: ...`), live multi-journal filter tabs, and expandable detailed lines drawers.
- Backend routing routes strictly flow: `Router -> Controller -> Service -> DB`

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
