# Modura (Urban Furniture Accounting System) — Design System

## 1. Design Philosophy & Visual Formula

The Modura Accounting System merges **Quiet Luxury** with **Financial Precision**. Unlike generic SaaS tools dominated by electric blues or purples, our interface evokes an earthy, architectural aesthetic inspired by high-end furniture showrooms and studio materials, while maintaining uncompromising clarity for enterprise double-entry bookkeeping.

```
                  MODURA
                    │
      ┌─────────────┼─────────────┐
      ↓             ↓             ↓
    COLOR       TYPOGRAPHY      SPACE
      │             │             │
 Deep Olive      Manrope      8px system
 Warm Ivory      600–700      16px cards
 Charcoal        400 body     24px padding
 Brass           Clear data   32px sections
      │             │             │
      └─────────────┼─────────────┘
                    ↓
             QUIET LUXURY
                    +
          FINANCIAL PRECISION
```

### Visual Balance
* **70% Clean Financial Software**: Restrained layouts, clear numbers, uncluttered tables, and white/neutral space.
* **20% Architectural & Furniture Aesthetic**: Warm neutrals, soft linen cards, deep olive navigation, and brass accents.
* **10% Luxury & Premium Character**: Subtle micro-interactions, refined border radii, and dignified typography.

### Anti-Patterns (What to Avoid)
* ❌ Colorful, overly saturated "fintech" palettes.
* ❌ Overly bubbly or rounded SaaS corners (e.g., 20–24px radii).
* ❌ Heavy drop shadows or loud multi-color gradients.
* ❌ "All-Green" overload: Keep **80–90%** of the UI neutral, reserving olive for navigation, primary buttons, active states, and key highlights.
* ❌ Giant, shouty typography or making every single label bold.

---

## 2. Color Palette — Elegant Olive

The palette is anchored in earthy olive tones, charcoal text, warm linen surfaces, and brass highlights.

| Token / Role | Swatch Name | Hex Code | Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | Deep Olive | `#5F6848` | Primary action buttons, active navigation indicators, key metrics. |
| **Primary Dark** | Forest Olive | `#454D35` | Sidebar background, focused action states, high-contrast badges. |
| **Background** | Warm Ivory | `#F7F5EF` | Global page canvas, outer shell background. |
| **Cards & Surfaces** | Soft Linen | `#FCFBF7` | Content cards, data tables, modals, flyouts. |
| **Main Text** | Charcoal | `#252824` | Primary headings, KPI figures, table values, high-priority labels. |
| **Secondary Text** | Muted Taupe | `#74776B` | Captions, metadata, column headers, timestamps, secondary labels. |
| **Borders** | Warm Gray | `#DCDDD3` | Subtle 1px dividers, card outlines, table row borders, input frames. |
| **Accent** | Brass Beige | `#B29A6A` | Secondary chart highlights, financial health accents, premium badges. |
| **Success** | Muted Green | `#687A55` | Balanced transactions, positive cash flow, paid invoices. |
| **Warning** | Warm Amber | `#B58A4A` | Overdue bills, payment risk warnings, approaching budget limits (>80%). |
| **Error** | Muted Brick | `#A65D52` | Unbalanced entries, critical budget breaches, rejected transfers. |

### UI Color Distribution
* **Top Header**: High-clarity `#FCFBF7` linen or dark card with `#5F6848` active category highlights and expandable 4-column mega-menu. Zero sidebar layout.
* **Primary Buttons**: `#5F6848` (Olive) with `#FCFBF7` text.
* **Wireframe Pill Action Buttons**: Soft sky-blue (`bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-100 border-sky-300`) with scale micro-animations (`active:scale-95 hover:scale-105`) for creation (`[New]`) and reporting (`[Report]`), rendered at compact `30px` height.
* **Elevated Metric Status Cards (Compact Sizing)**:
  - Soft linen background (`bg-card/95 backdrop-blur-md`) with compact padding (`p-4 sm:p-5`) and dual ambient brand lighting aura (`bg-primary/10` and `bg-accent/5 blur-2xl`) on hover.
  - Domain icon container with double ring / border (`ShoppingCart` for Sales, `Package` for Purchase, `Scale` for Budget Reports) at `p-2` with `18px` icon.
  - Interactive metric boxes featuring compact padding (`p-3 sm:p-3.5`), domain micro-icons (`Layers`, `CheckCircle2`, `Clock`, `Target`, `Wallet`, `Coins`), hover lift (`hover:-translate-y-1 hover:shadow-md`), bottom expanding color indicator line on hover (`after:h-0.75 after:scale-x-0 group-hover/box:after:scale-x-100 after:origin-left`), live status pulse dot, compact secondary monetary context chip (`₹42.85L`, `₹36.40L`, etc.), and slide-in `ArrowUpRight` indicator.
  - Slim visual ratio micro-progress bars (`h-1` rounded-full, e.g. 83.3% Confirmed vs 16.7% Draft, 80% Billed, 70.8% Variance Health) providing high information density without vertical sprawl.
* **Appearance Switcher**: Minimalist Sun/Moon icon toggle with rotating transition.
* **Page Background**: `#F7F5EF` (Warm Ivory).
* **Cards & Panels**: `#FCFBF7` (Soft Linen) with `#DCDDD3` border.
* **Headings & Financial Values**: `#252824` (Charcoal).
* **Secondary Text & Metadata**: `#74776B` (Muted Taupe).
* **Accents & Highlights**: `#B29A6A` (Brass Beige) used sparingly.

---

## 3. Typography — Manrope

The application exclusively standardizes on **[Manrope](https://fonts.google.com/specimen/Manrope)** for both headings and UI elements. Manrope provides geometric precision with humanistic warmth, ensuring numbers and financial figures remain razor-sharp and legible across resolutions.

### Typographic Scale & Hierarchy

| Element | Font | Size | Weight | Line Height | Color | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **H1 / Page Title** | Manrope | `32px` | `700` (Bold) | `40px` | Charcoal (`#252824`) | Main screen titles (e.g., "Financial Overview", "Invoices"). |
| **H2 / Section Title** | Manrope | `20px` | `600` (Semi-Bold) | `28px` | Charcoal (`#252824`) | Section headers (e.g., "Revenue Breakdown", "Recent Journals"). |
| **H3 / Card Header** | Manrope | `14px` | `600` (Semi-Bold) | `20px` | Charcoal (`#252824`) | Card titles and modal dialog headers. |
| **Primary KPI** | Manrope | `30–32px` | `600` (Semi-Bold) | `38px` | Charcoal (`#252824`) | Large financial hero numbers (e.g., `₹8,42,500`). |
| **Secondary KPI** | Manrope | `24px` | `600` (Semi-Bold) | `32px` | Charcoal (`#252824`) | Sub-metric card figures (e.g., `₹2,18,400`). |
| **Body Text** | Manrope | `14px` | `400` (Regular) | `22px` | Charcoal (`#252824`) | General content, descriptive copy, notes. |
| **Table Values** | Manrope | `14px` | `400 / 500` | `20px` | Charcoal (`#252824`) | Table rows, monetary amounts, descriptions. |
| **Labels & Metadata** | Manrope | `12–13px` | `500` (Medium) | `16px` | Muted Taupe (`#74776B`)| Form labels, table headers, timestamp metadata. |
| **Delta / Percent** | Manrope | `13px` | `500` (Medium) | `16px` | Success/Error/Brass | Comparison metrics (e.g., `↑ 12.4% vs last month`). |
| **Button Text** | Manrope | `14px` | `600` (Semi-Bold) | `20px` | White / Charcoal | Action buttons, tabs, interactive pills. |

### Visual Hierarchy Principles
1. **Level 1 (Primary)**: Page Title / Core KPI (32px / 700 / `#252824`).
2. **Level 2 (Secondary)**: Section Titles (20px / 600).
3. **Level 3 (Supporting)**: Explanations & context (14px / 400 / `#74776B`).
4. **Level 4 (Data)**: Financial numbers (28–32px / 600 / `#252824`).
5. **Level 5 (Labels)**: Field titles, captions, badges (12–13px / 500 / `#74776B`).
6. **Selective Weight**: Never make entire cards bold. Only the key metric or title gets visual emphasis; labels and deltas stay medium or regular.

---

## 4. Layout & Grid Architecture

The desktop experience uses a composed **12-column grid** constrained to a maximum width to prevent distortion on ultra-wide monitors.

```
┌────────────────────────────────────────────────────────────────────┐
│                         TOP BAR / HEADER (64px)                    │
├──────────────┬─────────────────────────────────────────────────────┤
│              │                                                     │
│   SIDEBAR    │                  MAIN CONTENT                       │
│   (240px)    │   Max Width: 1440px | Horiz Padding: 32px           │
│              │                                                     │
│              │   Page Title (32px)                                 │
│              │   Supporting Text (14px)                            │
│              │                                                     │
│              │   ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│              │   │   KPI   │ │   KPI   │ │   KPI   │ (Card Gap)    │
│              │   └─────────┘ └─────────┘ └─────────┘             │
│              │                                                     │
│              │   ┌────────────────────┐ ┌───────────────┐         │
│              │   │      CHART         │ │   SUMMARY     │         │
│              │   └────────────────────┘ └───────────────┘         │
│              │                                                     │
└──────────────┴─────────────────────────────────────────────────────┘
```

### Layout Specifications
* **Sidebar Width**: `240px` (fixed, collapsible on mobile/tablet).
* **Top Header Height**: `64px` (sticky, subtle bottom border `#DCDDD3`).
* **Content Max Width**: `1440px` (centered on wide viewports).
* **Horizontal Canvas Padding**: `32px` (`24px` on smaller laptop viewports).
* **Major Section Gap**: `32px` vertical spacing between distinct dashboard rows.
* **Component / Card Gap**: `16px` to `24px` grid gap.

---

## 5. Spacing System (8px Grid)

All layout and component dimensions adhere to a consistent 8px scale:

| Token | Pixels | Application |
| :--- | :--- | :--- |
| `space-1` | `4px` | Micro-spacing, badge internal padding, tight icon offsets. |
| `space-2` | `8px` | Icon ↔ text spacing, compact list item gaps, tag margins. |
| `space-3` | `12px` | Compact element padding, input vertical padding. |
| `space-4` | `16px` | Standard element spacing, table cell padding, sidebar horizontal padding. |
| `space-5` | `20px` | Button horizontal padding, modal inner section margins. |
| `space-6` | `24px` | Standard card internal padding, grid column gaps. |
| `space-8` | `32px` | Major section separation, dashboard row vertical spacing. |
| `space-10` | `40px` | Navigation item height, standard action button height. |
| `space-12` | `48px` | Hero section padding, modal padding. |
| `space-16` | `64px` | Page-level boundary spacing, header height. |

### Dashboard Vertical Rhythm Example
* **Page Header to KPI Grid**: `32px`
* **Between KPI Cards**: `16px` gap
* **KPI Grid to Analytics Charts**: `32px`
* **Between Analytics Chart & Summary**: `24px` gap
* **Analytics to Recent Transactions Table**: `32px`

---

## 6. Component Specifications

### 6.1 Cards
Subtle, structured cards that feel architectural rather than floating or toy-like.
* **Background**: `#FCFBF7` (Soft Linen)
* **Border**: `1px solid #DCDDD3` (Warm Gray)
* **Border Radius**: `12px` to `16px` (avoids overly playful `20px+` radii)
* **Padding**: `24px`
* **Box Shadow**: Subtle ambient shadow (`0 1px 3px rgba(37, 40, 36, 0.04)`)

### 6.2 Buttons
* **Primary Button**:
  * Background: `#5F6848` (Deep Olive), hover: `#454D35` (Forest Olive)
  * Text: `#FCFBF7` (Soft Linen), Weight: `600`, Size: `14px`
  * Height: `40px` – `44px`
  * Padding: `0 20px`
  * Radius: `8px`
* **Secondary / Outline Button**:
  * Background: `#FCFBF7` / transparent
  * Border: `1px solid #DCDDD3` (hover: `#5F6848`)
  * Text: `#252824` (Charcoal)
* **Ghost / Sub-Action Button**:
  * Background: transparent, hover: `rgba(95, 104, 72, 0.08)`
  * Text: `#5F6848` or `#74776B`

### 6.3 Navigation & Sidebar
* **Background**: Neutral or Forest Olive (`#454D35`) with quiet elegance.
* **Padding**: `16px`
* **Menu Item Height**: `40px`
* **Menu Item Gap**: `4px` to `8px`
* **Icon-to-Text Gap**: `10px`
* **Active State**: Dedicated accent pill with `#5F6848` indicator or subtle background tint, never glaring.

### 6.4 Data Tables (Accounting-Grade)
Accounting workflows require dense, scannable data presentation without visual clutter.
* **Row Height**: `52px` – `56px`
* **Header Height**: `44px`
* **Cell Padding**: `16px` horizontal
* **Dividers**: `1px solid #DCDDD3` horizontal dividers only (no vertical lines)
* **Header Style**: `12px`, `500` weight, uppercase tracking, `#74776B` (Muted Taupe)
* **Number Alignment**: Right-aligned, monospace/tabular figures enabled.

### 6.5 Charts & Data Visualization
* **Primary Dataset**: Deep Olive (`#5F6848`)
* **Secondary Dataset / Accent**: Brass Beige (`#B29A6A`)
* **Comparative / Muted Lines**: Taupe (`#74776B`) or dotted Warm Gray (`#DCDDD3`)
* **Gridlines**: Barely perceptible `rgba(220, 221, 211, 0.5)`
* **Philosophy**: Charts clarify trends; they do not overpower the numeric ledger.

---

## 7. Key UX & Micro-Features

### 1. Financial Health Indicator
A visual score (out of 100) on the dashboard synthesizing profitability, receivables aging, and cash liquidity into a single confident gauge styled in Olive and Brass.

### 2. Smart Alerts Feed
Contextual notification cards highlighting business risks (overdue invoices, budget threshold >80%, cash dips) using semantic Muted Brick (`#A65D52`), Warm Amber (`#B58A4A`), and Muted Green (`#687A55`) with one-click resolution actions.

### 3. Payment Risk Badges
Contextual risk tags rendered on customer sales orders and invoices derived from historical payment punctuality (Low Risk / Medium Risk / High Risk).

### 4. "Explain This Number" Modals
Interactive drill-down modals on P&L, Balance Sheet, and KPI widgets. Clicking any aggregate figure reveals the specific double-entry `JournalEntryLine` records that form the total.

### 5. "What Changed?" / Accounting Impact View
An interactive post-transaction drawer/modal showing the exact debit/credit journal entries (`Move` & `MoveLine`) created behind the scenes, visually confirming ledger integrity to the user.

### 6. Double-Entry Accounting Impact Ribbon & Transaction Card
An iconic UI element in the Quiet Luxury design system, representing live ledger postings:
* **Card Container**: `rounded-xl`, `border border-border/70`, `bg-card/80`, with smooth hover lift (`hover:-translate-y-0.5 hover:shadow-md`).
* **Domain Icon Box**: `p-2.5 rounded-xl bg-secondary text-secondary-foreground border border-border/40 shadow-2xs` with contextual domain icons (`ShoppingBag`, `Receipt`, `Landmark`, `Banknote`, `Layers`).
* **Title & Reference**: Bold item/line header, paired with a monospace reference badge (`BILL/...`, `INV-...`, `PAY-...`) and partner tag (`• Aura Architecture Studio`).
* **Accounting Impact Ribbon**:
  - Debit badge: `px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[11px] font-mono`
  - Balance indicator: `⇄` in `text-muted-foreground`
  - Credit badge: `px-2 py-0.5 rounded bg-accent/15 text-accent-foreground border border-accent/30 text-[11px] font-mono`
* **Expandable Double-Entry Drawer**: Smooth expansion displaying itemized `JournalEntryLine` records, account codes, analytic account cost centers, and a verified `Balanced Double-Entry (DR = CR)` seal.

### 7. Standard Button Proportions & Icon-Only Segmented Controls
* **Standard Button Sizing**: Header actions utilize canonical `size="sm"` (`h-9 px-3 rounded-md text-sm font-medium`) or `size="default"` (`h-10 px-4 py-2`), preserving typographic balance with icons (`h-4 w-4`).
* **Icon-Only Segmented Layout Toggle**: View controls (e.g. Cards vs Table) use minimal `size="icon"` (`h-8 w-8 rounded-md`) square buttons with contextual hover and active background highlights (`bg-background shadow-xs`), omitting text labels for optimal scanability.

---

## 8. Animation & Motion Tokens

To provide a refined, quiet luxury atmosphere, Modura utilizes subtle CSS animations for brand elements and portal interactions:
* **Float (`animate-float` / `animate-float-delayed`)**: Soft 5s–6s vertical hover movement (`translateY(-8px)`).
* **Pulse Glow (`animate-pulse-glow`)**: Ambient background radial aura expansion with subtle opacity breathing (0.35 to 0.7).
* **Slow Rotation (`animate-spin-slow`)**: 24s linear ambient gradient halo rotation behind the brand emblem.
* **Shimmer Text (`shimmer-text`)**: Fluid gradient text animation transitioning from Charcoal foreground through Brass Beige (`--accent`) with standard `background-clip: text` compatibility.


