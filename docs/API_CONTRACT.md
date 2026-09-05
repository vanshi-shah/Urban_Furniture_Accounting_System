# API Contract

## Principles
1. **Accounting Engine First**: All transaction endpoints (Sales, Purchases, Payments) implicitly interact with the accounting engine.
2. **Standard REST**: Standard HTTP methods and status codes.

## Endpoints

### Authentication & Tenant Setup
- `POST /api/auth/register` (Creates company, user, seeds standard Chart of Accounts & Journals, returns `{ success: true, token, user }`)
- `POST /api/auth/login` (Authenticates credentials, returns `{ token, user: { id, name, email, role, companyId } }`)

### Submissions
- `GET /api/submissions` (Lists tenant submissions; filters by ownerId unless ADMIN)
- `POST /api/submissions` (Creates design/finance proposal with title & description)
- `PATCH /api/submissions/:id/status` (Admin only: update approval status)

### Master Data (`/api/master`)
- `GET /api/master/contacts` & `POST /api/master/contacts`
- `PUT /api/master/contacts/:id` & `DELETE /api/master/contacts/:id`
- `GET /api/master/products` & `POST /api/master/products`
- `PUT /api/master/products/:id` & `DELETE /api/master/products/:id`
- `GET /api/master/accounts` & `POST /api/master/accounts`
- `GET /api/master/journals` & `POST /api/master/journals`
- `GET /api/master/analytic-accounts` & `POST /api/master/analytic-accounts`

### Transactions & Invoicing (`/api/orders`)
- `GET /api/orders` (Lists all sales and purchases)
- `POST /api/orders` (Creates a draft order with line items and auto-calculated totals)
- `POST /api/orders/:id/confirm` (Confirms order, automatically generates balanced debit/credit JournalEntry and posts to ledger)

### Accounting Engine (`/api/accounting`)
- `POST /api/accounting/entries` (Creates manual draft JournalEntry)
- `POST /api/accounting/entries/:id/post` (Validates debits == credits, posts entry immutably)
- `GET /api/accounting/entries` (Retrieves general ledger moves and detailed move lines)
- `GET /api/accounting/accounts/:id/balance` (Calculates live normal balance based on account type)

### Reports & Intelligence (`/api/reports`)
- `GET /api/reports/trial-balance` (Aggregates debits & credits across all accounts, confirms system balance)
- `GET /api/reports/profit-and-loss` (Aggregates income vs expenses, returns gross & net profit)
- `GET /api/reports/balance-sheet` (Aggregates Assets, Liabilities, and calculated Retained Earnings equity)
