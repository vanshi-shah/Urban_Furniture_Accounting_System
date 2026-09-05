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
- **AnalyticAccount/Budget**: For budget tracking.

### Transactions
- **Order**: Handles Purchase Orders (`PURCHASE_ORDER`), Vendor Bills (`VENDOR_BILL`), and Sales Invoices (`CUSTOMER_INVOICE`). Includes `reference`, `dueDate`, `paidCash`, `paidBank`, `amountDue`, and `sourceOrderId` (linking bills to originating purchase orders).
- **OrderLine**: Line items for orders with product reference, quantity, unit price, subtotal, linked `accountId` (Chart of Account), and `analyticAccountId` (Budget Analytics).
- **Payment**: Settlement record with `paymentNumber`, `paymentType` (SEND/RECEIVE), `method` (CASH/BANK), `status` (DRAFT/POSTED/CANCELLED), `amount`, `orderId`, and linked `journalEntryId`.

### Accounting
- **JournalEntry (Move)**: The accounting event.
- **JournalEntryLine (MoveLine)**: The individual debit or credit line.

## Example Flow
`Purchase Order` -> `Vendor Bill` -> `Vendor Bill` confirmed creates balanced `JournalEntry` (Debit Purchase a/c, Credit Creditor a/c) -> `Bill Payment` creates `Payment` & `JournalEntry` (Debit Creditor a/c, Credit Cash/Bank a/c).

---

## Team Database Setup & Synchronization

To provision the database:
```bash
cd backend
npx prisma migrate dev
node prisma/seed.js
```

This seeds 2 companies × 3 users × ~126 records per entity type.
