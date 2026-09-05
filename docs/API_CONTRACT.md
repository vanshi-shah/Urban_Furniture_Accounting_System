# API Contract

## Principles
1. **Accounting Engine First**: All transaction endpoints (Sales, Purchases, Payments) implicitly interact with the accounting engine.
2. **Standard REST**: Standard HTTP methods and status codes.

## Endpoints

### Authentication & Tenant Setup
- `POST /api/auth/register` — Creates company, user, seeds standard Chart of Accounts & Journals. Returns `{ success: true, token, user }`.
- `POST /api/auth/login` — Authenticates credentials. Returns `{ success: true, token, user: { id, name, email, role, companyId } }`. Returns `{ success: false, error }` on failure.
- `GET /api/auth/me` 🔒 — Validates Bearer token and returns current user profile `{ success: true, user }`. Used by the frontend on every page load to verify session integrity.

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

### Transactions, Invoicing & Payments (`/api/orders`)
- `GET /api/orders?type=PURCHASE_ORDER|VENDOR_BILL` (Lists all purchase orders and vendor bills)
- `GET /api/orders/next-sequence?type=PURCHASE_ORDER|VENDOR_BILL` (Generates next sequence e.g. `PO0001` or `BILL/2026/0001`)
- `GET /api/orders/:id` (Retrieves single order with lines, contact, sourceOrder, journalEntry, and payments)
- `POST /api/orders` (Creates draft order or bill with line items, accounts, and analytics)
- `POST /api/orders/:id/confirm` (Confirms order; for Vendor Bills, automatically creates balanced Journal Entry in Purchases journal)
- `POST /api/orders/:id/create-bill` (Converts Purchase Order into Vendor Bill with lines and vendor preserved)
- `POST /api/orders/:id/pay` (Records payment against bill via Cash or Bank, updates paid amounts/amountDue, and creates payment journal entry)
- `POST /api/orders/check-budget` (Checks whether line amounts exceed the remaining budget limit of analytic accounts)

### Accounting Engine (`/api/accounting`)
- `POST /api/accounting/entries` (Creates manual draft JournalEntry)
- `POST /api/accounting/entries/:id/post` (Validates debits == credits, posts entry immutably)
- `GET /api/accounting/entries` (Retrieves general ledger entries with enriched relations: `journal`, `lines.account`, `lines.contact`, `lines.analyticAccount`, ordered by date descending)
- `GET /api/accounting/accounts/:id/balance` (Calculates live normal balance based on account type)

### Reports & Intelligence (`/api/reports`)
- `GET /api/reports/trial-balance` (Aggregates debits & credits across all accounts, confirms system balance)
- `GET /api/reports/profit-and-loss` (Aggregates income vs expenses, returns gross & net profit)
- `GET /api/reports/balance-sheet` (Aggregates Assets, Liabilities, and calculated Retained Earnings equity)
