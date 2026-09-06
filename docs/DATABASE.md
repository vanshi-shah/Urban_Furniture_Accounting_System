# Database Schema Strategy

## Core Philosophy
The database must support a strict double-entry accounting system where business transactions (invoices, payments) immutably generate journal entries.

## Role-Based Access Control (RBAC)

The system uses a three-tier role model enforced at both the backend API and frontend routing levels.

| Role | Enum Value | Access Level |
|---|---|---|
| **Admin** | `ADMIN` | Full access — all pages, all operations, user management |
| **Accountant** | `ACCOUNTANT` | Create master data, record transactions, view all accounting reports |
| **User** | `USER` | View own CUSTOMER_INVOICE orders (paid/unpaid), pay outstanding invoices |

### Demo Credentials (all passwords: `Password@123`)

**Urban Furniture Co.**
| Email | Role |
|---|---|
| `admin@urbanfurniture.com` | ADMIN |
| `accountant@urbanfurniture.com` | ACCOUNTANT |
| `user@urbanfurniture.com` | USER |

**Modern Teak Ltd.**
| Email | Role |
|---|---|
| `manager@modernteak.com` | ADMIN |
| `books@modernteak.com` | ACCOUNTANT |
| `staff@modernteak.com` | USER |

---

## Key Domains

### Master Data
- **Contact**: Customers, Vendors.
- **Product**: Items being sold/purchased.
- **Account**: Chart of Accounts (Assets, Liabilities, Equity, Income, Expenses).
- **Journal**: Categories for journal entries (Bank, Sales, Purchases).
- **AnalyticAccount**: For project, departmental, and cost-center budget tracking.
- **Budget & BudgetLine**: Period-based financial budgets (`DRAFT`, `CONFIRMED`, `REVISED`, `CANCELLED`, `DONE`) linked to `AnalyticAccount` with `committedAmount`, start/end dates, responsible person, and revision tracking.

### Transactions
- **Order**: Handles Purchase Orders (`PURCHASE_ORDER`), Vendor Bills (`VENDOR_BILL`), and Sales Invoices (`CUSTOMER_INVOICE`). Includes `reference`, `dueDate`, `paidCash`, `paidBank`, `amountDue`, and `sourceOrderId` (linking bills to originating purchase orders).
- **OrderLine**: Line items for orders with product reference, quantity, unit price, subtotal, linked `accountId` (Chart of Account), and `analyticAccountId` (Budget Analytics).
- **Payment**: Settlement record with `paymentNumber`, `paymentType` (SEND/RECEIVE), `method` (CASH/BANK), `status` (DRAFT/POSTED/CANCELLED), `amount`, `orderId`, and linked `journalEntryId`.

### Accounting
- **JournalEntry (Move)**: The accounting event, holding `date`, `reference`, `journalId`, `status` (DRAFT/POSTED), and company reference.
- **JournalEntryLine (MoveLine)**: The individual debit or credit line, linking to `accountId` (`Account`), `contactId` (`Contact`), and `analyticAccountId` (`AnalyticAccount`). Enforced in queries to drive live double-entry ribbons (`DR: ... ⇄ CR: ...`).

## Example Flow
`Purchase Order` -> `Vendor Bill` -> `Vendor Bill` confirmed creates balanced `JournalEntry` (Debit Purchase a/c, Credit Creditor a/c) -> `Bill Payment` creates `Payment` & `JournalEntry` (Debit Creditor a/c, Credit Cash/Bank a/c). All records surfaced in the Full Journal Ledger (`/journal-entries`).

---

## Team Database Setup & Synchronization

To provision the database:
```bash
cd backend
npx prisma db push
npx prisma generate
node prisma/seed.js
```

### Database Seeding Status (Verified Active)
- **Companies**: 2 (Urban Furniture Co., Modern Teak Ltd.)
- **Users**: 6 total (ADMIN, ACCOUNTANT, USER per tenant)
- **Contacts**: 252 (126 per company, CUSTOMER & VENDOR)
- **Products**: 252 (126 per company, GOODS, SERVICE, COMBO)
- **Analytic Accounts**: 50 (25 per company)
- **Submissions**: 252 (126 per company, round-robin across all 3 roles)
- **Orders**: 252 (126 per company, PURCHASE_ORDER, VENDOR_BILL, CUSTOMER_INVOICE)
- **Journal Entries**: 252 (126 per company, balanced double-entry lines)
- **Budgets & Lines**: 30 budgets (15 per company with linked analytic lines & expense entries)

### Seeded Credentials (Password: `Password@123`):
- `admin@urbanfurniture.com` → ADMIN (Urban Furniture Co.)
- `accountant@urbanfurniture.com` → ACCOUNTANT (Urban Furniture Co.)
- `user@urbanfurniture.com` → USER (Urban Furniture Co.)
- `manager@modernteak.com` → ADMIN (Modern Teak Ltd.)
- `books@modernteak.com` → ACCOUNTANT (Modern Teak Ltd.)
- `staff@modernteak.com` → USER (Modern Teak Ltd.)
