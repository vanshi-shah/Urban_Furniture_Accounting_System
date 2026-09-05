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

### Transactions
- `GET /api/sales`
- `POST /api/sales` (Triggers invoice & journal entry generation if needed)
- `GET /api/sales/:id`
- `GET /api/purchases`
- `POST /api/purchases`
- `GET /api/purchases/:id`

### Invoices & Payments
- `GET /api/invoices`
- `POST /api/invoices`
- `GET /api/payments`
- `POST /api/payments` (Triggers journal entry generation)

### Reports & Intelligence
- `GET /api/reports/profit-loss`
- `GET /api/reports/balance-sheet`
- `GET /api/reports/budget`
- `GET /api/dashboard` (Returns financial health score)
- `GET /api/alerts` (Returns smart financial alerts)
- `GET /api/insights/explain-number?metric=profit&period=current`