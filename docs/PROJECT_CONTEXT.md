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
*   **Auth Wiring *(Completed)*:**
    *   **Backend `/api/auth/me`**: Protected GET endpoint — validates Bearer token and returns full user object. Used by the frontend on every mount to verify session integrity server-side.
    *   **Backend login normalization**: `POST /api/auth/login` now consistently returns `{ success: true, token, user }` (same shape as register).
    *   **Frontend `AuthContext`**: On mount, verifies the stored token via `/auth/me`. If token is expired or invalid, session is cleared immediately. Optimistic restore from localStorage is used for snappy UX while server verifies.
    *   **Frontend `api.ts`**: Added a 401 response interceptor — automatically clears localStorage and redirects to `/login` when the backend rejects a token.
    *   **Seed script** (`prisma/seed.js`): Seeds 2 demo companies with Admin + User accounts each. All credentials use bcrypt-hashed `password123`.
*   **Micro-Changes:**
    *   *Frontend:* Dedicated animated Welcome screen greeting users with dynamic "Welcome"/"Welcome Back" states, smooth routing to Login/Register, auto-redirect to dashboard when logged in, and localStorage token persistence. *(Completed)*
    *   *Backend:* Global error handler middleware with Zod/Prisma error mapping, standardized port 5000, and permissive dev CORS. *(Completed)*

### Phase 2: Master Data Setup *(Completed)*
*   **Database:** Models for `Contact` (type: Customer/Vendor), `Product`, `Account` (Chart of Accounts), `Journal`, and `AnalyticAccount` (Budgets).
*   **Backend:** CRUD REST endpoints for Master Data (`/api/master/contacts`, `/api/master/products`, etc.) with sanitized body guards.
*   **Frontend:** Built complete Master Data multi-view suites for **Contacts** (`/contacts`) and **Products** (`/products`), featuring List View, Kanban View, and Master Form View (with category creation on the fly, product type drop-downs, financial margin calculations, and image upload).
*   **Micro-Changes:**
    *   *Frontend:* Search, filter pills, unit profit/margin gauges, and live view switching.
    *   *Backend:* `sanitizeBody` protection stripping blacklisted fields.

### Phase 3: Core Accounting Engine (The Brain)
*   **Database:** Create `JournalEntry` (Move) and `JournalEntryLine` (MoveLine) models.
*   **Backend:** Build the central `AccountingService`. This service handles the strict logic:
    *   *Rule:* Sum of Debits must always equal Sum of Credits.
    *   *Rule:* Entries become immutable once "Posted".
*   **Frontend:** Build a "Ledger" view to see all raw journal entries.
*   **Micro-Changes:**
    *   *Backend:* Function to automatically calculate the "Balance" of an account.
    *   *Backend:* Function to auto-generate reversing entries (if needed).

### Phase 4: Business Transactions (Purchase Orders & Sales) *(Completed)*
*   **Database:** `Order` and `OrderLine` models supporting `PURCHASE_ORDER`, `VENDOR_BILL`, and `CUSTOMER_INVOICE`.
*   **Backend:** Automatic sequence numbering (`PO0001`...), budget checking against analytic limits, and `createBillFromPO` endpoint.
*   **Frontend:** Built Excel Sheet Purchase Order interface (`/purchase-orders`) with live formulas, Product/Analytics master dropdowns, non-blocking `⚠️ Exceeds Approved Budget` warning, and 1-click `Create Bill` navigation. Export to Excel (.csv) and Print/PDF.

### Phase 5: Financial Operations (Vendor Bills & Payments) *(Completed)*
*   **Database:** `Order` payment tracking (`paidCash`, `paidBank`, `amountDue`), `Payment` model, and relations to `JournalEntry`.
*   **Backend:** 
    *   API to confirm Vendor Bill and immediately auto-generate balanced double-entry Journal Entry (Debit: Purchase a/c, Credit: Creditor a/c).
    *   API to record Payment (Debit: Creditor a/c, Credit: Cash/Bank a/c).
*   **Frontend:** 
    *   Vendor Bill screen (`/vendor-bills`) with sequence `BILL/2026/0001`, `ABC-26-001` reference, dynamic status badges (`Paid`, `Partial`, `Not Paid`), smart `PO` and `Budget` navigation buttons, and financial totals breakdown.
    *   **Bill Payment Modal**: `Draft -> Posted -> Cancelled` workflow breadcrumbs, `Send`/`Receive`, auto-fetched partner/amount, `Cash`/`Bank` selection, and options gear providing `Print / PDF` and `Excel Export`.
    *   **Demo Journal Entry (`/demo-journal-entry`)**: Displays balanced `Purchase a/c` and `Creditor a/c` debit/credit entries with post and reset actions.

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

- Added product validation in masterData.controller.js
- Added journal frontend and backend validation

### Phase 9: Top Mega-Menu, Zero-Sidebar & Elevated Wireframe Section Cards
- **Zero-Sidebar Architecture**: Shifted layout to edge-to-edge canvas with sticky 64px header and 4-column expandable mega-menu covering `Sales`, `Purchase`, `Account`, and `Report`.
- **Wireframe Section Cards Elevation**:
  - Recreated 3 core section cards (`Sales`, `Purchase`, `Budget Reports`) adhering to the whiteboard wireframe.
  - Implemented Quiet Luxury aesthetics with Soft Linen cards, dual ambient lighting auras, and tactile scale hover micro-interactions.
  - Added 3 interactive metric tiles per section (`All`, `Confirmed`, `Draft` / `Achieved`, `Budget`, `Committed`) with hover lift (`-translate-y-1`), sliding bottom indicator lines, secondary monetary valuations, micro-progress ratio bars, and status pulse indicators.
  - Compact sizing optimization: reduced box padding to `p-3 sm:p-3.5`, font sizes to `text-2xl sm:text-3xl font-mono`, and section spacing to `space-y-3.5` for high-density, no-scroll dashboard layout.
  - Connected direct click-through filters to Sales Orders, Purchase Orders, and Budget Reports.
