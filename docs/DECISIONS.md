# Decisions

## Core Hackathon Decisions

1. **Project Selection**: Picked "Urban Furniture Accounting System" over "DealFlow360". It offers higher certainty of a polished, complete demo for a 2-person team while having a strong underlying technical requirement (double-entry).
2. **Differentiator**: Adding a rule-based "Intelligence Layer" on top of the accounting data instead of building just a standard CRUD ERP.
3. **AI vs Rules**: Decided against black-box AI. Financial intelligence will be rule-based and deterministic so it is explainable (e.g., "Why is profit X?").
4. **UX Focus**: Emphasize the "Transaction → Accounting Impact" visual flow. Users must see how creating a sale updates the ledger and the P&L immediately.
5. **UI Design System & Aesthetics**: Selected "Elegant Olive" (Deep Olive `#5F6848`, Forest Olive `#454D35`, Warm Ivory `#F7F5EF`, Soft Linen `#FCFBF7`, Charcoal `#252824`, Taupe `#74776B`, Warm Gray `#DCDDD3`, Brass Beige `#B29A6A`) paired with **Manrope** typography and an 8px spacing system. This gives an architectural, premium furniture showroom aesthetic blended with serious financial precision rather than a generic SaaS look.
6. **Frontend Authentication Architecture**: Implemented React Context (`AuthContext`) backed by `localStorage` persistence and Axios request interceptors for JWT token handling. Built strict `ProtectedRoute` and `PublicRoute` route guards, pre-fill demo accounts for judging evaluation, and strictly enforced the "no self-elevated roles" rule by omitting role selection on registration (backend assigns standard employee role).
