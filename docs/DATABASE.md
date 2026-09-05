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
