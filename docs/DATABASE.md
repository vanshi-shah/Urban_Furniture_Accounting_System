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
- **Order**: Handles both Sales (CUSTOMER_INVOICE) and Purchases (VENDOR_BILL).
- **OrderLine**: Line items for orders.
- **Payment**: Financial settlement.

### Accounting
- **JournalEntry (Move)**: The accounting event.
- **JournalEntryLine (MoveLine)**: The individual debit or credit line.

## Example Flow
`Sale` creates `Invoice` -> `Invoice` confirmed creates `JournalEntry` (Debit Accounts Receivable, Credit Sales Revenue) -> `Payment` creates `JournalEntry` (Debit Bank, Credit Accounts Receivable).

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

