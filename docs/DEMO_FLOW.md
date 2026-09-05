# Demo Flow (5-Minutes)

**Theme: "Every transaction tells a story — Modura automatically traces that story from bespoke craft to real-time financial insight."**

## 🔐 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@urbanfurniture.com` | `password123` |
| **Employee** | `designer@urbanfurniture.com` | `password123` |

> These users can be logged in instantly via **1-Click Quick Demo Access** directly on the **Welcome Page** (`/welcome`) or the **Login Page** (`/login`).

### -0:30 — Modura Welcome Portal Experience
- Present the animated **Modura Welcome Page** (`/` or `/welcome`).
- Show the dynamic "Welcome to Modura" greeting, the breathing luxury brand emblem, and the 1-click Quick Demo login.
- Click "Admin Account" or "Sign In to Ledger" to enter the system.

### 0:00 — Dashboard & Top Mega-Menu
- Note the edge-to-edge layout with **no sidebar** and modern top navbar (`Sales | Purchase | Account | Report`).
- Click any top category: observe the **expandable 4-column mega-menu** smoothly sliding down with all architecture links.
- Click the Sun/Moon icon toggle: show instant theme switching between light and dark modes.
- Highlight the **3 Core Section Cards** matching the whiteboard wireframe with Quiet Luxury craft & compact sizing:
  - **Sales Card**: `[New]` button, `All (12 · ₹42.85L)`, `Confirmed (10 · ₹36.40L)`, `Draft (2 · ₹6.45L)` status cards with active ratio progress bars.
  - **Purchase Card**: `[New]` button, `All (5 · ₹18.20L)`, `Confirmed (4 · ₹14.50L)`, `Draft (1 · ₹3.70L)` status cards with goods received trackers.
  - **Budget Reports Card**: `[Report]` button, `Achieved (3 · ₹24.80L)`, `Budget (2 · ₹35.00L)`, `Committed (4 · ₹8.40L)` status cards with variance health indicators.
- **Showcase Hover Physics & Compact Layout**: Hover over each card to display the ambient lighting aura, smooth hover lift (`-translate-y-1`), sliding bottom indicator line, and animated corner drill-down arrow in a compact, scannable format.
- Click on any status card (e.g. `Draft (2)` in Sales or `Confirmed (4)` in Purchase) to demonstrate direct filtered navigation.
- Highlight the **Financial Health Score** (94/100) and revenue breakdown below the cards.

### 0:30 — Purchase Order & Vendor Bill Excel Flow
- Open **Purchase Orders** (`/purchase-orders`):
  - View sequence `PO0001`, Vendor `Mr. Rahul`, Date, and the interactive Excel Sheet grid.
  - Show live formula calculation: Qty (3) * Unit Price (2,000) = Total (6,000).
  - Click **Confirm**: Observe the non-blocking warning: `⚠️ Exceeds Approved Budget: The entered amount is higher than the remaining budget amount for this budget line.`
  - Click **Create Bill**: Seamlessly transfers vendor, products, price, and quantities to **Vendor Bills** (`/vendor-bills`).
- Inspect **Vendor Bill** (`BILL/2026/0001`):
  - Point out smart buttons: `PO` (jumps back to originating PO) and `Budget` (opens analytic report).
  - Show Status badge: initially `Not Paid` (amount due == total).
  - Click **Confirm**: Informs that a balanced Journal Entry has been created in the Purchases journal.
  - Click **Pay**: Opens the **Bill Payment** modal with status breadcrumb `Draft -> Posted`, `Send`, `Mr. Rahul`, `₹ 6,000`, and `Cash/Bank`.
  - Confirm payment: status badge instantly turns to green `Paid`, Amount Due drops to `₹ 0`, and options gear allows **Print / PDF** and **Excel Export**.
  - Navigate to **Demo Journal Entry** (`/demo-journal-entry`): Visually demonstrate the balanced debit (`Purchase a/c` ₹6,000) and credit (`Creditor a/c` ₹6,000).

### 1:30 — Create Sale
- Workflow: Customer -> 5 Office Chairs -> Sales Order -> Invoice.
- Show **Payment Risk** indicator on the invoice.

### 2:15 — Receive Payment & Accounting Impact
- Workflow: ₹XX received -> Bank -> Journal Entry.
- **Signature UX**: Visually show the Accounting Impact (Debit/Credit) of the action just performed, highlighting the new **Journal Entries List View** (`/journal-entries`) and balancing checks.

### 3:00 — Reports
- Open **P&L**: Show how the numbers just increased.
- Open **Balance Sheet**.

### 3:45 — Budget
- Show **Budget vs Actual** (e.g., Budget: ₹10L, Actual: ₹8.7L, 87% utilized).

### 4:15 — Smart Alert
- Point out an alert: "The system detected that receivables are becoming high."

### 4:40 — Explain Number
- Click: **"Why is my profit ₹X?"** and show the breakdown.

### 5:00 — Conclusion
- "Modura doesn't just record transactions. Every bespoke business action automatically flows through double-entry accounting and explains what is happening financially in real time."

