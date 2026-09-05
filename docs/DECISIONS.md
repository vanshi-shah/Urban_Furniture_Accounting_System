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

17. **Zero-Sidebar Top Navbar, Expandable 4-Column Mega-Menu & Wireframe Dashboard Recreation**:
    - **Zero Sidebar**: Completely eliminated the left sidebar in `DashboardLayout.tsx` in favor of a sleek top navigation header, freeing maximum width for accounting tables, Excel grids, and financial reports.
    - **Expandable Mega-Menu Navigation**: Recreated the top navigation bar with 4 core pillars (`Sales`, `Purchase`, `Account`, `Report`). Clicking any item triggers a modern, slide-down 4-column mega-menu panel linking to every business process with subtle backdrop blur and escape dismissal.
    - **Icon-Only Theme Toggle**: Replaced segmented theme toggle with an icon-only button toggle (`variant="icon"`) with rotating Sun/Moon animation.
    - **Wireframe Dashboard Section Cards**: Recreated the 3 primary cards on `Dashboard.tsx` (`Sales`, `Purchase`, `Budget Reports`) featuring pill action buttons (`New`, `Report`) and 3-box status metrics (`All`, `Confirmed`, `Draft` / `Achieved`, `Budget`, `Committed`) that act as live interactive filters, while retaining the financial health score radar, charts, alerts, and double-entry ledger impact below.
    - **Connected Routes**: Connected all navigation destinations to dedicated views: Sales Orders (`/sales-orders`), Sale Invoices (`/sales-invoices`), Receipts (`/receipts`), Balance Sheet (`/reports/balance-sheet`), Profit and Loss (`/reports/profit-and-loss`), and Budget Reports (`/reports/budget-report`).

18. **Streamlined Dashboard Content Canvas**:
    - Removed the redundant "App Dashboard" header banner and subtitle from `Dashboard.tsx` so the wireframe section cards (`Sales`, `Purchase`, `Budget Reports`) initiate immediately at the top of the viewport, eliminating visual clutter.

19. **Financial Reports Resilience, Safe Normalization & Application ErrorBoundary**:
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

17. **Zero-Sidebar Top Navbar, Expandable 4-Column Mega-Menu & Wireframe Dashboard Recreation**:
    - **Zero Sidebar**: Completely eliminated the left sidebar in `DashboardLayout.tsx` in favor of a sleek top navigation header, freeing maximum width for accounting tables, Excel grids, and financial reports.
    - **Expandable Mega-Menu Navigation**: Recreated the top navigation bar with 4 core pillars (`Sales`, `Purchase`, `Account`, `Report`). Clicking any item triggers a modern, slide-down 4-column mega-menu panel linking to every business process with subtle backdrop blur and escape dismissal.
    - **Icon-Only Theme Toggle**: Replaced segmented theme toggle with an icon-only button toggle (`variant="icon"`) with rotating Sun/Moon animation.
    - **Wireframe Dashboard Section Cards**: Recreated the 3 primary cards on `Dashboard.tsx` (`Sales`, `Purchase`, `Budget Reports`) featuring pill action buttons (`New`, `Report`) and 3-box status metrics (`All`, `Confirmed`, `Draft` / `Achieved`, `Budget`, `Committed`) that act as live interactive filters, while retaining the financial health score radar, charts, alerts, and double-entry ledger impact below.
    - **Connected Routes**: Connected all navigation destinations to dedicated views: Sales Orders (`/sales-orders`), Sale Invoices (`/sales-invoices`), Receipts (`/receipts`), Balance Sheet (`/reports/balance-sheet`), Profit and Loss (`/reports/profit-and-loss`), and Budget Reports (`/reports/budget-report`).

18. **Streamlined Dashboard Content Canvas**:
    - Removed the redundant "App Dashboard" header banner and subtitle from `Dashboard.tsx` so the wireframe section cards (`Sales`, `Purchase`, `Budget Reports`) initiate immediately at the top of the viewport, eliminating visual clutter.

19. **Financial Reports Resilience, Safe Normalization & Application ErrorBoundary**:
    - Resolved runtime `TypeError: Cannot read properties of undefined (reading 'map')` at `Reports.tsx:360` by adding safe data normalizers (`normalizedBS`, `normalizedPnL`, `displayedBudgets`) for `/reports/balance-sheet`, `/reports/profit-and-loss`, and `/reports/budget-report`.
    - Harmonized backend `ReportService` responses (`details.assets`, `details.liabilities`, `details.equity`, `totalIncome`, `totalExpense`) with frontend schema while ensuring realistic atelier fallbacks are displayed when tenant databases are fresh or unposted.
    - Added defensive array guards (`(items || []).map(...)`) across all report breakdowns, empty state fallbacks, dynamic net profit margin calculation, and one-click multi-format CSV exports.
    - Added the fourth standard double-entry financial report: **Trial Balance** (`/reports/trial-balance`) providing general ledger debit/credit verification and balanced status indicator.
    - Created and integrated `<ErrorBoundary>` (`src/components/common/ErrorBoundary.tsx`) wrapping the root application tree in `App.tsx` to prevent unhandled React errors from causing white-screen crashes and provide 1-click page reload recovery.

20. **Quiet Luxury Dashboard Card Elevation & Hover Micro-Animations**:
    - Transformed the three wireframe dashboard section cards (`Sales`, `Purchase`, `Budget Reports`) from basic static boxes into interactive, high-craft financial cards adhering strictly to `DESIGN_SYSTEM.md`.
    - Added domain icon containers (`ShoppingCart`, `Package`, `Scale`), subtitle metadata chips, and tactile action buttons with hover scale transitions.
    - Each metric status box now features individual semantic icons (`Layers`, `CheckCircle2`, `Clock`, `Target`, `Wallet`, `Coins`), card hover lift (`hover:-translate-y-1 hover:shadow-md`), animated sliding bottom indicator lines (`after:h-0.5 after:scale-x-0 group-hover:after:scale-x-100`), live status pulse dots, and interactive `ArrowUpRight` indicators.

21. **Tactile Hover Physics, Visual Depth & Micro-Progress Bars on Dashboard Cards**:
    - Further elevated the dashboard cards to address user feedback on visual interest, tactile response, and Quiet Luxury aesthetics.
    - Added dual ambient lighting auras (`bg-primary/10` and `bg-accent/5 blur-3xl`) that expand and brighten on hover.
    - Introduced multi-layer hover lift (`hover:-translate-y-1.5 hover:shadow-lg duration-300`) with smooth border color shifts (`hover:border-primary/60`, `hover:border-emerald-500/60`, `hover:border-amber-500/60`).
    - Added individual corner ambient radial gradients inside each tile that fade in upon cursor hover.
    - Implemented visual ratio micro-progress bars (83.3% Confirmed vs 16.7% Draft, 80% Billed, 70.8% Variance Health) giving immediate visual weight to the numbers.
    - Embedded secondary financial context chips (`₹42.85 Lakhs gross volume`, `₹36.40 Lakhs ready to dispatch`, `₹18.20 Lakhs committed supply`, `₹24.80 Lakhs actual spend`) providing immediate business value beyond raw order counts.
    - Integrated sliding bottom color indicator bars (`after:h-0.75 after:origin-left group-hover:after:scale-x-100`) and corner navigation arrow micro-translations.

22. **Compact Sizing & Proportional Density for Wireframe Dashboard Cards**:
    - Streamlined the 3 dashboard section cards (`Sales`, `Purchase`, `Budget Reports`) to reduce visual bulk and eliminate unnecessary vertical scrolling.
    - Outer cards reduced from `p-6 sm:p-7` to `p-4 sm:p-5`, outer headers from `text-2xl` to `text-lg sm:text-xl`, and action buttons to `30px` compact pills.
    - Metric boxes reduced from `p-5` to `p-3 sm:p-3.5`, hero numerals scaled to `text-2xl sm:text-3xl font-mono`, micro-progress bars streamlined to `h-1`, and spacing between sections tightened from `space-y-6` to `space-y-3.5`.
    - Reduced overall card vertical height by ~40% while preserving all interactive hover physics, monetary values, and live pulse indicators.

23. **Full Journal Ledger Navigation & Atelier Transaction Card UI for Journal Entries**:
    - **Dashboard Navigation**: Linked the "Full Journal Ledger" button in `Dashboard.tsx` (`Recent Atelier Transactions & Accounting Impact` section) to directly route to `/journal-entries` (`navigate("/journal-entries")`).
    - **Quiet Luxury Journal Entries Interface**: Re-engineered `frontend/src/pages/JournalEntries.tsx` from a rudimentary plain table into a luxury double-entry ledger interface directly matching the dashboard transaction rows (Image 1).
    - **Double-Entry Impact Ribbon**: Each transaction card renders the balanced double-entry accounting ribbon (`DR: <Code> <Account>` ⇄ `CR: <Code> <Account>`) with color-coded token badges, partner tags, reference badges, formatted INR currency, and relative timestamps.
    - **Live Ledger Sync & Multi-Journal Filtering**: Integrated filter tabs (`All`, `Purchases`, `Sales`, `Cash`, `Bank`, `General`) and status pills (`All`, `Posted`, `Draft`), combined with full text search across references, accounts, descriptions, and partner contacts.
    - **Expandable Detailed Lines Drawer**: Users can click any card to smoothly expand a detailed double-entry lines table displaying account codes, partner, analytic project accounts, line descriptions, separate debit/credit columns, and balanced status confirmation badge (`Balanced Double-Entry • DR = CR`).
    - **View Mode Switcher**: Added a toggle between luxury "Cards" ledger view (dashboard style) and compact "Table" view for rapid scanning.
    - **Enriched Backend Query**: Updated `backend/src/controllers/accounting.controller.js` to include `contact` and `analyticAccount` on `lines`, ensuring partner names and project codes resolve dynamically for live data.
    - **Preserved & Elevated Form View**: Maintained full "+ New Entry" modal capabilities with dynamic multi-line debit/credit balancing validation, draft persistence, and immediate posting.

24. **Standard Button Sizing & Icon-Only Layout Toggle Refinement**:
    - **Header Button Standardization**: Standardized the header action buttons (`New Entry`, `Dashboard`, and form action buttons) in `JournalEntries.tsx` to use standard shadcn/ui button proportions (`size="sm"` with default `h-9` and `rounded-md`), removing custom pill heights (`h-8.5`) and fixing duplicate plus icons (`+ + New Entry` -> single `<Plus /> New Entry`).
    - **Icon-Only Layout Switcher**: Removed text labels ("Cards", "Table") from the view toggle, converting it into a clean, minimal icon-only segmented control (`<LayoutGrid className="h-4 w-4" />` and `<List className="h-4 w-4" />` in standard `size="icon" h-8 w-8 rounded-md` buttons).


