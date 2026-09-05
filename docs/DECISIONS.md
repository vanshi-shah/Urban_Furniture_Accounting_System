# Decisions

## Core Hackathon Decisions

1. **Project Selection**: Picked "Urban Furniture Accounting System" over "DealFlow360". It offers higher certainty of a polished, complete demo for a 2-person team while having a strong underlying technical requirement (double-entry).
2. **Differentiator**: Adding a rule-based "Intelligence Layer" on top of the accounting data instead of building just a standard CRUD ERP.
3. **AI vs Rules**: Decided against black-box AI. Financial intelligence will be rule-based and deterministic so it is explainable (e.g., "Why is profit X?").
4. **UX Focus**: Emphasize the "Transaction → Accounting Impact" visual flow. Users must see how creating a sale updates the ledger and the P&L immediately.
5. **UI Design System & Aesthetics**: Selected "Elegant Olive" (Deep Olive `#5F6848`, Forest Olive `#454D35`, Warm Ivory `#F7F5EF`, Soft Linen `#FCFBF7`, Charcoal `#252824`, Taupe `#74776B`, Warm Gray `#DCDDD3`, Brass Beige `#B29A6A`) paired with **Manrope** typography and an 8px spacing system. This gives an architectural, premium furniture showroom aesthetic blended with serious financial precision rather than a generic SaaS look.
6. **Frontend Authentication Architecture**: Implemented React Context (`AuthContext`) backed by `localStorage` persistence and Axios request interceptors for JWT token handling. Built strict `ProtectedRoute` and `PublicRoute` route guards, pre-fill demo accounts for judging evaluation, and strictly enforced the "no self-elevated roles" rule by omitting role selection on registration (backend assigns standard employee role).
7. **API Resilience, Port Synchronization & Multi-tenant Provisioning**:
   - Standardized the backend to port `5000` and updated frontend `api.ts` / `socket.ts` / `.env` to eliminate port 4000/5000 mismatches.
   - Fixed unhandled asynchronous route exceptions by wrapping async route handlers with standard Express `next(error)` handling and a structured `errorHandler` translating Zod validation and Prisma constraints.
   - Synchronized JWT user claims (`id` and `userId`) across all middleware and controllers so foreign-key assignments (e.g. `ownerId`) and tenant queries never receive `undefined`.
   - Automated provisioning of the standard Chart of Accounts (Cash, Bank, AR, AP, Equity, Revenue, COGS) and primary Journals (Cash, Bank, Sales, Purchases, General) directly upon company registration, ensuring orders can immediately post balanced ledger entries without missing account errors.
   - Dedicated local development port `5000` exclusively to the interactive terminal `nodemon` watcher, eliminating duplicate background daemon bindings and `EADDRINUSE` conflicts.
8. **Brand Integration & Security Sanitization**:
   - Incorporated the official brand logo (`logo.png`) as the official favicon and across all primary navigation components (Welcome page, Dashboard Layout sidebar, Login, and Registration pages) under the official brand name **Modura** (Urban Furniture Accounting System).
   - The generic `makeCrud` factory in `masterData.controller.js` runs all incoming request bodies through a `sanitizeBody()` guard that strips `passwordHash`, `companyId`, `id`, `createdAt`, and `updatedAt` before any `create` or `update` call. This prevents hash-injection attacks and ensures `companyId` is always sourced from verified JWT claims.
9. **Animated Modura Welcome Portal (`/welcome` & `/`)**:
   - Created a dedicated, animated entry portal distinct from multi-section landing pages.
   - Welcomes users with dynamic greeting ("Welcome to Modura" vs "Welcome back to Modura" for returning sessions), animated breathing brand emblem with ambient lighting aura, floating hallmark badges, and 1-click Quick Demo login paths for Admin and Employee roles.
   - Wired default entry route `/` and `/welcome` to greet unauthenticated visitors and offer smooth transitions to `/login` and `/register`.
10. **Backend Error Logging & Client-Side Sanitization**:
   - Upgraded global `errorHandler.js` so that all internal Prisma stack traces, connection failures, query errors, and file paths are strictly logged on the backend console (`console.error`).
   - Responses sent to the frontend are cleanly sanitized (e.g. "Database service is currently unreachable", "A record with this information already exists", validation alerts) preventing raw stack dumps from appearing in the user interface.
11. **Modura Accounting Dashboard & Component Gallery Suppression**:
   - Fully rebuilt `Dashboard.tsx` from the legacy hackathon starter to the official Modura financial intelligence architecture: Financial Health Score Radar (94/100), core financial KPIs (Revenue, COGS, Net Profit, Liquidity, AR/AP), Smart Alerts feed with action CTAs, monthly trajectory charts in Olive & Brass tokens, and interactive "Explain This Number" drilldown modal.
   - Removed and suppressed the Component Gallery route and navigation item from `DashboardLayout.tsx` and `App.tsx` for focused presentation of core accounting workflows.
12. **Auth & User Creation Wireframe Alignment**:
   - **Login Page (`/login`)**: Built matching wireframe layout with centered logo, `Login Id -`, `Password -`, `SIGN IN`, and bottom `Forgot Password | Sign Up` links. Returns standardized `"Invalid Login Id or Password"` error.
   - **Sign Up Page (`/signup` & `/register`)**: Enforces strict criteria: Login Id (6-12 chars), valid email, password (>8 chars, uppercase, lowercase, special character), and password confirmation.
   - **Forgot Password (`/forgot-password`)**: Token-based recovery request flow with immediate dispatch confirmation and return navigation.
   - **Create User (`/users/create`)**: Admin/Accountant user provisioning with wireframe layout (`Name`, `Login Id`, `Email Id`, Role selection: `User`, `Accountant`, `Administrator`, and password validation).
13. **Contacts Master Multi-View Pattern (List, Kanban & Form Views)**:
    - Implemented Master Data architecture on **Contacts** (`/contacts`) supporting List view with checkboxes, Kanban view cards, and Form view with image upload and address groupings.
14. **Product Master Form View & Kanban View Implementation**:
    - Replaced the placeholder products screen with a fully interactive **Product Master** supporting List, Kanban, and Form Views adhering to the Elegant Olive design system and wireframe requirements.
    - **Form View**: Action bar (`New`, `Confirm`, `Back`), Product Name, Product Type selector (`Goods`, `Service`, `Combo`), Many2one Category selection with "Create on the fly" inline dialog, Sales Price & Cost inputs with real-time Gross Margin calculation, internal SKU, descriptions, and drag-and-drop Image Upload.
    - **Kanban View**: Visual card grid rendering image thumbnail, product title, category & type badges, highlighted Sales Price & Cost, and unit margin percentages with hover elevation and quick edit triggers.
    - **List View**: Dense financial data table with selection checkboxes, image avatars, monospace currency formatting in INR, and quick action controls.
    - **Backend & Local Storage Synchronization**: Connected to `/master/products` using TanStack Query and local persistence for reliable online/offline presentation.
16. **Purchase Order to Vendor Bill Workflow & Excel Sheet Integration**:
    - Built dedicated Excel Sheet data grids with cell-level editing, formula calculation (`Qty * Unit Price = Total`, running column sum), letter column headers (A, B, C...), row indices (1, 2...), and one-click export to both **Excel (.csv)** and **Print / PDF**.
    - **Purchase Order (`/purchase-orders`)**: Auto-sequence generator (`PO0001`, `PO0002`...), Vendor Master selector, Excel data table, non-blocking `⚠️ Exceeds Approved Budget` warning, and 1-click `Create Bill` transition.
    - **Vendor Bill (`/vendor-bills`)**: Auto-sequence generator (`BILL/2026/0001`...), Alphanumeric reference (`ABC-26-001`), single status badge computation (`Paid` if amount due = 0, `Partial` if amount due < total, `Not Paid` if amount due == total), `PO` smart link (only shown if created from PO), `Budget` smart link (opens analytic budget report), and auto-creation of balanced double-entry Journal Entry in Purchases journal.
    - **Bill Payment Modal**: `Draft` -> `Posted` -> `Cancelled` status breadcrumbs, `Send`/`Receive` payment type, auto-fetched partner & amount, `Cash` or `Bank` payment method, and options gear menu providing `1. Print / PDF` and `2. Excel Export`.
    - **Demo Journal Entry (`/demo-journal-entry`)**: Dedicated view with `Post`, `Reset to Draft`, `Back`, auto-fetched bill date and `Purchase` journal, balanced debit (`Purchase a/c`) and credit (`Creditor a/c`).








## Product Backend Validation
Added backend validation for product name and price in masterData.controller.js.


## Journal Validation
Added frontend and backend validation for Journals using react-hook-form + zod on the frontend, and manual body validation in masterData.controller.js on the backend.
