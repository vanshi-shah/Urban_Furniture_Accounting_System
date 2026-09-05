# Database Schema Strategy

## Core Philosophy
The database must support a strict double-entry accounting system where business transactions (invoices, payments) immutably generate journal entries.

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

To allow both teammates to access and seed the same ledger state:
1. **Shared Database (Recommended)**: Use a hosted PostgreSQL connection string (Supabase / Neon) in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://<user>:<password>@<cloud-host>:5432/<dbname>?sslmode=require"
   ```
2. **Local PostgreSQL**: If running locally on `localhost:5432`, ensure the local PostgreSQL service is started:
   ```env
   DATABASE_URL="postgresql://postgres:<password>@localhost:5432/urban_finance?schema=public"
   ```
3. **Provisioning & Seeding**:
   ```bash
   cd backend
   npx prisma db push
   npm run seed
   ```
   Demo accounts seeded:
   - `admin@urbanfurniture.com` / `password123` (Admin)
   - `designer@urbanfurniture.com` / `password123` (Employee)

