# Frontend Guidelines

# Frontend Guidelines

## 1. Core Architecture
- **Framework**: React (Vite + TypeScript/JavaScript), running locally on port `3000`.
- **Typing & Compilation**: Strict TypeScript compiler (`tsconfig.json`) with `@types/node`, `@types/react`, `@types/react-dom` installed, path aliases (`@/*` mapping to `./src/*`), and `tsc -b` bundle verification.
- **Styling**: Tailwind CSS configured with semantic design tokens and HSL CSS variables.
- **Components**: Reusable component architecture (`DataTable`, `SearchBox`, `ConfirmDialog`, `Modal`, `MetricCard`).
- **Icons**: Lucide React.
- **Charts**: Recharts / Chart.js styled to match the Elegant Olive palette.

## 2. Visual & Aesthetic Standards (Quiet Luxury & Financial Precision)
- **Typography**: Strictly use **Manrope** from Google Fonts across all headings, body copy, and data tables.
  - Page titles: `32px / 700 / Charcoal (#252824)`
  - Section titles: `20px / 600`
  - KPIs: `30–32px / 600`
  - Body & Tables: `14px / 400 or 500`
  - Labels & Metadata: `12–13px / 500 / Muted Taupe (#74776B)`
- **Color System (Elegant Olive)**:
  - Background: Warm Ivory (`#F7F5EF`)
  - Cards / Surfaces: Soft Linen (`#FCFBF7`)
  - Primary Action / Buttons: Deep Olive (`#5F6848`)
  - Sidebar / Dark Accents: Forest Olive (`#454D35`)
  - Headings / Values: Charcoal (`#252824`)
  - Secondary Text: Muted Taupe (`#74776B`)
  - Borders & Dividers: Warm Gray (`#DCDDD3`)
  - Accents: Brass Beige (`#B29A6A`)
  - Keep 80–90% of the UI neutral, with olive applied thoughtfully for navigation, buttons, and active states.

## 3. Layout & Spacing
- **Desktop Grid**: 12-column grid with a `1440px` max-width container and `32px` horizontal padding.
- **Header**: Fixed `64px` height with subtle bottom border.
- **Sidebar**: Fixed `240px` width.
- **Spacing Scale**: 8px system (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Card Styling**: Rounded `12px` to `16px`, `24px` internal padding, `1px solid #DCDDD3`, and subtle ambient shadow.

## 4. Tables & Financial Data Formatting
- **Accounting Tables**: Row heights of `52–56px`, cell padding `16px`, header height `44px`.
- **Dividers**: Clean horizontal borders only (`#DCDDD3`); avoid harsh vertical gridlines.
- **Number Formatting**: Always right-align monetary numbers. Use Indian currency format (`₹8,42,500`) with monospace/tabular numbers (`font-variant-numeric: tabular-nums`).
- **Visual Weight**: Do not make entire tables or cards bold. Emphasize only the key numbers.

## 5. Required Interactive Micro-Features
1. **Financial Health Indicator**: Visual score gauge on the dashboard combining liquidity, profitability, and receivables.
2. **Smart Financial Alerts**: Actionable alerts feed (Overdue Invoices, Budget >80%, Cash Low) with direct resolution CTA buttons.
3. **Payment Risk Badges**: Color-coded risk tags on customer sales/invoices (Low / Medium / High Risk).
4. **"Explain This Number" Drill-Down**: Clickable aggregate rows on P&L and Balance Sheet that open a modal detailing the exact journal entries.
5. **"What Changed?" / Accounting Impact View**: Post-transaction confirmation showing the balanced Debit/Credit journal entry generated.

## 6. Authentication, Welcome Experience & Security Standards
- **Welcome Portal (`/` and `/welcome`)**:
  - Unauthenticated visitors land on the dedicated animated Modura Welcome Page.
  - Features dynamic greeting ("Welcome to Modura" / "Welcome back to Modura"), animated breathing brand emblem, and direct paths to Sign In, Register, or 1-Click Quick Demo access.
- **Login Page (`/login`)**:
  - Centered App Logo, `Login Id -`, `Password -`, `SIGN IN` button, and `Forgot Password | Sign Up` links.
  - Returns friendly `"Invalid Login Id or Password"` error on mismatch.
- **Sign Up Page (`/signup` & `/register`)**:
  - Centered App Logo, `Enter Login Id -` (6-12 chars), `Enter Email Id -`, `Enter Password -` (>8 chars, uppercase, lowercase, special character), `Re-Enter Password -`, and `SIGN UP` button.
- **Forgot Password Page (`/forgot-password`)**:
  - Allows entering Login Id / Email with confirmation alert and return link.
- **Create User (`/users/create`)**:
  - Form layout for provisioning internal team accounts with `Name`, `Login Id`, `Email Id`, Role (`User`, `Accountant`, `Administrator`), and password requirements.
- **Session Storage**: JWT stored securely in `localStorage` under key `token`, with user object cached under `user`.
- **Axios Interceptor**: Automatically attaches `Authorization: Bearer <token>` to all requests dispatched via `api.ts`.
- **Route Guards**:
  - `ProtectedRoute`: Guards `/dashboard`, `/users/create`, and financial workflows. Redirects unauthenticated users to `/login`.
  - `PublicRoute`: Prevents authenticated users from accessing public auth routes, routing them to `/dashboard`.
- **Hackathon Demo Support**:
  - Quick demo credentials buttons on both the Welcome screen and Login screen allow 1-click credential auto-fill and direct entry for Admin and Employee profiles.

- Use React + Vite.
- Build clean, dashboard-centric interfaces.
- Emphasize readability of financial numbers.
- Ensure that the "Accounting Impact" of every transaction is clearly communicated to the user.
- Build interactive reports where aggregate numbers can be clicked to reveal underlying data ("Explain this number").

## 7. Master Data Multi-View Pattern (List, Kanban, and Form Views)
All Master Data screens (Contacts, Products, Analytics) follow a unified 3-view workflow:
1. **List View (Default)**:
   - Header action bar with `New` button, live `Search` input, `Back` navigation, and view mode toggle buttons (`List` vs `Kanban`).
   - Density-optimized table with row selection, image avatars, key metadata columns, and status/type badges.
   - Clicking any row navigates directly to the Master Form View populated with that record.
2. **Kanban View**:
   - Responsive grid of cards displaying the avatar thumbnail on the left, and entity title, email, phone, location, and role badges on the right.
   - Clicking any Kanban card opens the Master Form View for that record.
3. **Master Form View (Create & Edit)**:
   - Header action bar containing `New` (blank form reset), `Confirm` (save/commit), and `Back` (return to List/Kanban).
   - 2-Column form grid: Left column with entity attributes and address groups; Right column with drag-and-drop Image Upload preview.


