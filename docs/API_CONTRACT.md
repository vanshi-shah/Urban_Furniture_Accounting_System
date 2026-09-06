# API Contract

## Principles
1. **Accounting Engine First**: All transaction endpoints (Sales, Purchases, Payments) implicitly interact with the accounting engine.
2. **Standard REST**: Standard HTTP methods and status codes.
3. **RBAC Enforced**: Every protected endpoint checks role. `ADMIN` always passes all role checks.

## Role Permissions Summary

| Endpoint Group | ADMIN | ACCOUNTANT | USER |
|---|:---:|:---:|:---:|
| Auth (`/api/auth`) | ✅ | ✅ | ✅ |
| Submissions (`/api/submissions`) | ✅ | ✅ | ✅ |
| Submission status update | ✅ | ❌ | ❌ |
| Master Data (`/api/master`) | ✅ | ✅ | ❌ |
| Orders — list/view | ✅ | ✅ | ✅ (invoices only) |
| Orders — create/confirm/bill | ✅ | ✅ | ❌ |
| Orders — pay | ✅ | ✅ | ✅ (own invoices) |
| Accounting Entries (`/api/accounting`) | ✅ | ✅ | ❌ |
| Reports (`/api/reports`) | ✅ | ✅ | ❌ |

---

## Endpoints

### Authentication & Tenant Setup
- `POST /api/auth/register` — Creates company, user, seeds standard Chart of Accounts & Journals. Returns `{ success: true, token, user }`.
- `POST /api/auth/login` — Authenticates credentials. Returns `{ success: true, token, user: { id, name, email, role, companyId } }`. Returns `{ success: false, error }` on failure.
- `GET /api/auth/me` 🔒 — Validates Bearer token and returns current user profile `{ success: true, user }`. Used by the frontend on every page load to verify session integrity.

### Submissions 🔒 (All roles)
- `GET /api/submissions` — Lists tenant submissions.
- `POST /api/submissions` — Creates proposal with title & description.
- `PATCH /api/submissions/:id/status` — **ADMIN only**: update approval status.

### Master Data (`/api/master`) 🔒 ADMIN + ACCOUNTANT
> **Note on List Format**: All `GET /api/master/*` endpoints return a paginated envelope: `{ data: T[], total: number, page: number, totalPages: number }`. Clients must access `res.data` for the records array.
- `GET /api/master/contacts?page=1&limit=20` & `POST /api/master/contacts`
- `PUT /api/master/contacts/:id` & `DELETE /api/master/contacts/:id`
- `GET /api/master/products?page=1&limit=20` & `POST /api/master/products`
- `PUT /api/master/products/:id` & `DELETE /api/master/products/:id`
- `GET /api/master/accounts?page=1&limit=20` & `POST /api/master/accounts`
- `GET /api/master/journals?page=1&limit=20` & `POST /api/master/journals`
- `GET /api/master/analytic-accounts?page=1&limit=20` & `POST /api/master/analytic-accounts`

### Transactions, Invoicing & Payments (`/api/orders`) 🔒
> **Note on List Format**: `GET /api/orders` returns a paginated envelope: `{ data: Order[], total: number, page: number, totalPages: number }`.
- `GET /api/orders` 🔒 All roles — ADMIN/ACCOUNTANT see all; USER sees only `CUSTOMER_INVOICE` orders. Supports `?type=CUSTOMER_INVOICE|VENDOR_BILL|PURCHASE_ORDER` and `&limit=...`.
- `GET /api/orders/next-sequence?type=...` 🔒 ADMIN + ACCOUNTANT
- `GET /api/orders/:id` 🔒 All roles — USER restricted to their invoices only.
- `POST /api/orders` 🔒 **ADMIN + ACCOUNTANT** — Creates draft order/bill with line items, accounts, analytics.
- `POST /api/orders/:id/confirm` 🔒 **ADMIN + ACCOUNTANT** — Confirms order; auto-creates Journal Entry for Vendor Bills.
- `POST /api/orders/:id/create-bill` 🔒 **ADMIN + ACCOUNTANT** — Converts PO into Vendor Bill.
- `POST /api/orders/:id/pay` 🔒 All roles — Records payment. USER can only pay `CUSTOMER_INVOICE` orders.
- `POST /api/orders/check-budget` 🔒 ADMIN + ACCOUNTANT

### Accounting Engine (`/api/accounting`) 🔒 ADMIN + ACCOUNTANT
- `POST /api/accounting/entries` — Creates manual draft JournalEntry.
- `POST /api/accounting/entries/:id/post` — Validates debits == credits, posts entry immutably.
- `GET /api/accounting/entries` — Retrieves general ledger entries with enriched relations: `journal`, `lines.account`, `lines.contact`, `lines.analyticAccount`, ordered by date descending.
- `GET /api/accounting/accounts/:id/balance` — Calculates live normal balance based on account type.

### Budgets & Budget Lines (`/api/budgets`) 🔒 ADMIN + ACCOUNTANT
- `GET /api/budgets` — Retrieves all budgets for company, including lines, analytic accounts, achieved vs committed amounts.
- `POST /api/budgets` — Creates a new budget with period dates and budget line items.
- `PUT /api/budgets/:id/confirm` — Transitions budget to `CONFIRMED`.
- `PUT /api/budgets/:id/revise` — Revises budget with optional reason/version.
- `PUT /api/budgets/:id/cancel` — Transitions budget to `CANCELLED`.
- `PUT /api/budgets/:id/complete` — Transitions budget to `DONE`.

### Reports & Intelligence (`/api/reports`) 🔒 ADMIN + ACCOUNTANT
- `GET /api/reports/trial-balance` — Aggregates debits & credits across all accounts.
- `GET /api/reports/profit-and-loss` — Aggregates income vs expenses, returns gross & net profit.
- `GET /api/reports/balance-sheet` — Aggregates Assets, Liabilities, and calculated Retained Earnings equity.
- `GET /api/reports/budget` — Aggregates budget performance vs actual ledger transactions.

