# API Contract

## Principles
1. **Accounting Engine First**: All transaction endpoints (Sales, Purchases, Payments) implicitly interact with the accounting engine.
2. **Standard REST**: Standard HTTP methods and status codes.

## Endpoints

### Master Data
- `GET /api/contacts`
- `POST /api/contacts`
- `GET /api/products`
- `POST /api/products`
- `GET /api/chart-of-accounts`

### Transactions (Orders)
- `GET /api/orders` (Lists all sales and purchases)
- `POST /api/orders` (Creates a draft order)
- `POST /api/orders/:id/confirm` (Confirms order, triggers automated Journal Entry generation)

### Invoices & Payments
- `GET /api/invoices`
- `POST /api/invoices`
- `GET /api/payments`
- `POST /api/payments` (Triggers journal entry generation)

### Reports & Intelligence
- `GET /api/reports/trial-balance` (Added in Phase 5)
- `GET /api/reports/profit-and-loss` (Added in Phase 5)
- `GET /api/reports/balance-sheet` (Added in Phase 5)
- `GET /api/reports/budget`
- `GET /api/dashboard` (Returns financial health score)
- `GET /api/alerts` (Returns smart financial alerts)
- `GET /api/insights/explain-number?metric=profit&period=current`
