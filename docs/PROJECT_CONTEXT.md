# Project Context

## The Project: Modura (Urban Furniture Accounting System)
An intelligent accounting workflow and quiet luxury financial operating system for bespoke furniture ateliers and urban architecture businesses.

## The Strategy
For a 2-member team, we chose the Accounting problem statement over DealFlow360. We will implement the core double-entry accounting engine perfectly, and then layer on **Smart Financial Intelligence** to create a "Wow" factor.

## Core Features (Must Have)
1. Animated Welcome Experience & Authentication (Modura Portal)
2. Contacts (Customers & Vendors)
3. Products & Bill of Materials
4. Chart of Accounts (COA)
5. Journals (Bank, Cash, Sales, Purchases, General)
6. Sales & Purchases
7. Invoices & Vendor Bills
8. Payments
9. Double-entry Journal Entries
10. P&L, Balance Sheet, Budget

## Micro-Features (The Differentiators)
1. *Animated Welcome Portal*: Cinematic Modura entry portal greeting visitors with dynamic "Welcome" / "Welcome Back" greeting, brand aura, and 1-click quick demo access.
2. *Financial Health Score*: Dashboard metric combining cash, profit, and receivables.
3. *Smart Financial Alerts*: Rule-based alerts for overdue invoices or budget overruns.
4. *Budget vs Actual*: Visual trackers for budget utilization.
5. *Payment Risk*: Contextual risk assessment when viewing invoices.
6. *"Explain This Number"*: Breakdown of P&L metrics.
7. *Transaction -> Accounting Impact*: Visually showing the ledger updates after every business action.


## Detailed Phase-by-Phase Development Plan

To ensure we build this effectively, we will construct the core features and the intelligence micro-features simultaneously. Here is the exact breakdown of micro-changes expected in each phase.

### Phase 1: Foundation (DB, Auth & Animated Welcome Portal)
*   **Database:** Initialize PostgreSQL database. Create Prisma schema for `User` and `Company`.
*   **Backend:** Set up Express server. Implement JWT-based authentication (Login, Register with token generation and default COA provisioning). Fully tested and verified. *(Completed)*
*   **Frontend:** Scaffold React app with Modura Olive & Brass design system (Tailwind/shadcn), Manrope typography, animated **Welcome Portal** (`/welcome` & root `/`), Login/Register screens, and routing & global state for Auth (`AuthContext`), `ProtectedRoute` / `PublicRoute` guards, plus 1-click demo access. *(Completed)*
*   **Micro-Changes:**
    *   *Frontend:* Dedicated animated Welcome screen greeting users with dynamic "Welcome"/"Welcome Back" states, smooth routing to Login/Register, auto-redirect to dashboard when logged in, and localStorage token persistence. *(Completed)*
    *   *Backend:* Global error handler middleware with Zod/Prisma error mapping, standardized port 5000, and permissive dev CORS. *(Completed)*

### Phase 2: Master Data Setup
*   **Database:** Create models for `Contact` (type: Customer/Vendor), `Product`, `Account` (Chart of Accounts), `Journal`, and `AnalyticAccount` (Budgets).
*   **Backend:** CRUD REST endpoints for Master Data. Seed script to populate standard Chart of Accounts (Assets, Liabilities, Equity, Revenue, Expenses) and standard Journals (Bank, Cash, Sales, Purchases).
*   **Frontend:** Build Master Data management tables with generic CRUD modals.
*   **Micro-Changes:**
    *   *Frontend:* Search and pagination for all master data tables.
    *   *Backend:* Validation to prevent deleting accounts/products if they have linked transactions.

### Phase 3: Core Accounting Engine (The Brain)
*   **Database:** Create `JournalEntry` (Move) and `JournalEntryLine` (MoveLine) models.
*   **Backend:** Build the central `AccountingService`. This service handles the strict logic:
    *   *Rule:* Sum of Debits must always equal Sum of Credits.
    *   *Rule:* Entries become immutable once "Posted".
*   **Frontend:** Build a "Ledger" view to see all raw journal entries.
*   **Micro-Changes:**
    *   *Backend:* Function to automatically calculate the "Balance" of an account.
    *   *Backend:* Function to auto-generate reversing entries (if needed).

### Phase 4: Business Transactions (Sales & Purchases) *(Completed)*
*   **Database:** Create `Order` and `OrderLine` models (handling both Sales and Purchases).
*   **Backend:** API to create Sales/Purchases.
*   **Frontend:** Create forms for New Sale and New Purchase (Product select, quantity, price, tax).
*   **Micro-Feature (Transaction -> Accounting Impact):** 
    *   *Frontend:* When a sale is confirmed, display a modal or timeline element showing "Sale Created". (No journal entry yet, just the business document).
*   **Micro-Changes:**
    *   *Backend:* Auto-calculate subtotal, tax, and total.

### Phase 5: Financial Operations (Invoices & Payments) *(Backend Completed)*
*   **Database:** Create `Invoice`, `InvoiceLine`, and `Payment` models.
*   **Backend:** 
    *   API to convert Order -> Invoice. (This triggers the `AccountingService` to debit Receivables and credit Revenue).
    *   API to record Payment. (This triggers the `AccountingService` to debit Bank and credit Receivables).
*   **Frontend:** Invoice Generation screen. Payment modal.
*   **Micro-Feature (Payment Risk):** 
    *   *Backend:* Query past late payments for a contact.
    *   *Frontend:* Show a Yellow/Red badge on the Invoice screen if the customer has a history of late payments.
*   **Micro-Feature (Transaction -> Accounting Impact):**
    *   *Frontend:* When an invoice is created, visually render the exact Debit/Credit journal entry that was generated in the background. Do the same when payment is received.

### Phase 6: Reporting & Analytics *(Backend Completed in Phase 5)*
*   **Backend:** Endpoints for `/api/reports/profit-loss`, `/balance-sheet`, and `/budget`. These endpoints aggregate data directly from `JournalEntryLine`.
*   **Frontend:** Dedicated reporting dashboards with charts (e.g., Chart.js or Recharts).
*   **Micro-Feature (Budget vs Actual):** 
    *   *Backend:* Join `AnalyticAccount` budget limits against actual ledger expenses.
    *   *Frontend:* Render a progress bar (Green -> Yellow -> Red) for marketing/sales budgets.
*   **Micro-Feature ("Explain This Number"):**
    *   *Frontend:* Make the P&L rows clickable. Clicking opens a modal fetching the specific `JournalEntryLines` that make up that sum.

### Phase 7: The Intelligence Layer (Dashboard)
*   **Backend:** Create `/api/dashboard/health` and `/api/alerts` endpoints.
*   **Micro-Feature (Financial Health Score):**
    *   *Backend:* Calculate score out of 100 using a formula (e.g., strong cash + low receivables = high score).
    *   *Frontend:* Display a large gauge chart on the home dashboard.
*   **Micro-Feature (Smart Financial Alerts):**
    *   *Backend:* Rule-engine evaluating: overdue invoices (>0), budget utilization (>80%), cash flow dips.
    *   *Frontend:* Render a "Smart Alerts" feed on the dashboard with actionable buttons ("Send Reminder").

### Phase 8: Polish & Demo
*   **Full Stack:** Seed the database with a realistic "Urban Furniture" scenario (historical data, past transactions) so reports aren't empty.
*   **Frontend:** Polish the UI. Ensure hover states, loading skeletons, and transitions (glassmorphism, micro-animations) feel premium.
*   **Demo Prep:** Rehearse the 5-minute script specifically walking through: Dashboard -> Purchase -> Sale -> Payment -> P&L -> "Explain this Number".
