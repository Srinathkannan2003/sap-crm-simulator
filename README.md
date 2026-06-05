# SAP CRM Sales Process Simulator

> A production-quality Angular 20 web application simulating the end-to-end SAP CRM sales process — built as a portfolio and resume project.

![Angular](https://img.shields.io/badge/Angular-20-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Angular Material](https://img.shields.io/badge/Angular_Material-20-purple?logo=angular)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4-orange?logo=chart.js)
![JSON Server](https://img.shields.io/badge/JSON_Server-1.0-green)

---

## 📋 Project Overview

The **SAP CRM Sales Process Simulator** replicates the key workflows of SAP CRM — from lead capture to quote approval — in a modern Angular application with SAP Fiori-inspired UI design. It is purpose-built to demonstrate enterprise Angular development skills for roles such as:

- Angular / Frontend Developer
- SAP CRM Functional Consultant
- Full-Stack Developer (SAP ecosystem)

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── core/
│   │   ├── guards/          # Auth & role guards
│   │   ├── interceptors/    # HTTP interceptors
│   │   ├── models/          # TypeScript interfaces
│   │   └── services/        # API & business services
│   ├── shared/
│   │   └── components/
│   │       └── shell/       # App shell (sidebar + header)
│   └── modules/
│       ├── auth/            # Login module
│       ├── dashboard/       # KPIs & charts
│       ├── business-partner/ # Customer CRUD
│       ├── lead-management/ # Lead lifecycle
│       ├── opportunity/     # Pipeline management
│       ├── activity/        # Activity tracking
│       ├── quotes/          # Quote builder + approval
│       └── reports/         # Analytics & exports
├── environments/
└── styles/                  # Global SCSS
```

---

## ✨ Features

### 🔐 Authentication
- Role-based login (Sales Manager / Sales Representative)
- Session persistence with `sessionStorage`
- Angular Signals for auth state
- Route guards protecting all pages

### 📊 Dashboard
- 6 KPI cards: Customers, Open Leads, Converted Leads, Open Opps, Pipeline, Active Quotes
- Lead Status Distribution (Doughnut chart)
- Opportunity Pipeline by Stage (Bar chart)
- Monthly Revenue Forecast (Line chart)
- Upcoming Activities feed
- Top Opportunities table

### 👥 Business Partner Management
- Full CRUD for 20 seeded customers
- Search, filter by industry/type/status
- Sortable, paginated table
- Detailed view with related Leads, Opps, Activities
- CSV export

### 📥 Lead Management
- Create, edit, delete leads
- Status workflow: New → Qualified → Converted → Lost
- Convert Lead to Opportunity with one click
- Status summary chips + advanced filters
- Lead detail with timeline progress indicator

### 📈 Opportunity Management
- List view + Kanban Pipeline view
- Stage-based pipeline: Discovery → Qualification → Proposal → Negotiation → Closed Won/Lost
- Auto-probability suggestion by stage
- Revenue forecast (weighted by probability)
- Related activities panel

### 📅 Activity Management
- Track Calls, Meetings, Emails, Tasks
- Schedule, complete, and cancel activities
- Filter by type, status, priority
- One-click complete with outcome notes

### 💰 Quote Management
- Create quotes with dynamic line items
- Product catalog lookup
- Automatic subtotal, discount, tax, and grand total
- Approval workflow: Draft → Submitted → Approved/Rejected
- Printable quote document view
- Manager-only approve/reject controls

### 📑 Reports
- Lead Report: status distribution, by-industry, by-source charts
- Opportunity Report: pipeline analysis, win/loss, revenue by stage
- Revenue Report: monthly forecast, per-rep analysis, quote pipeline
- CSV export for all reports
- Period filter (Q3, Q4, YTD)

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Angular | 20 | SPA Framework |
| TypeScript | 5.8 | Strict typing |
| Angular Material | 20 | UI Component library |
| RxJS | 7.8 | Reactive data streams |
| Chart.js + ng2-charts | 4.4 / 6.0 | Dashboard charts |
| JSON Server | 1.0 | Mock REST backend |
| SCSS | - | SAP Fiori styling |
| Angular Signals | built-in | Reactive state |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/sap-crm-simulator.git
cd sap-crm-simulator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start JSON Server (backend)
```bash
npm run server
# Runs at http://localhost:3000
```

### 4. Start Angular dev server
```bash
npm start
# Runs at http://localhost:4200
```

### 5. Run both concurrently
```bash
npm run dev
```

---

## 🔑 Demo Credentials

| Role | Username | Password |
|---|---|---|
| Sales Manager | `manager` | `manager123` |
| Sales Rep 1 | `rep1` | `rep123` |
| Sales Rep 2 | `rep2` | `rep123` |

> **Sales Manager** can approve/reject quotes and access all records.
> **Sales Representatives** can manage their own leads, opps, activities.

---

## 📦 Build & Deploy

### Production build
```bash
npm run build:prod
```

### GitHub Pages deployment
```bash
npm run deploy
```

---

## 🗂️ Seed Data

The mock backend (`db.json`) includes:
- **20 customers** across industries (Tech, Healthcare, Finance, Manufacturing, etc.)
- **20 leads** with varied statuses and sources
- **15 opportunities** covering all pipeline stages
- **30 activities** (calls, meetings, emails, tasks)
- **10 quotes** with full line items (Draft, Submitted, Approved, Rejected)
- **14 products** in the product catalog

---

## 📸 Screenshot Placeholders

Create screenshots of:
1. `screenshots/01-login.png` — Login page with quick-access buttons
2. `screenshots/02-dashboard.png` — Dashboard with KPI cards and charts
3. `screenshots/03-customers.png` — Customer list with filters
4. `screenshots/04-customer-detail.png` — Customer 360-degree view
5. `screenshots/05-leads.png` — Lead list with status summary
6. `screenshots/06-lead-convert.png` — Lead detail with Convert button
7. `screenshots/07-pipeline.png` — Opportunity pipeline (Kanban view)
8. `screenshots/08-quote-builder.png` — Quote form with line items
9. `screenshots/09-quote-detail.png` — Printable quote with approval stamp
10. `screenshots/10-reports.png` — Reports dashboard with charts

---

## 📝 Resume Description

**SAP CRM Sales Process Simulator** | Angular 20 · TypeScript · Angular Material · Chart.js

> Architected and built a full-stack CRM application simulating SAP's end-to-end sales process. Implemented lazy-loaded feature modules for Business Partner, Lead Management, Opportunity Pipeline, Activity Tracking, Quote Builder, and Analytics Reports. Used Angular Signals for reactive state management, Chart.js for KPI dashboards, and a JSON Server mock API. Delivered a SAP Fiori-inspired UI with role-based access control (Sales Manager / Sales Representative), a Kanban pipeline view, and a printable quote approval workflow.

---

## 📚 SAP CRM Concepts Simulated

| SAP Object | Simulated Feature |
|---|---|
| Business Partner (BP) | Customer CRUD, 360 view |
| Lead | Lead lifecycle, source tracking, conversion |
| Opportunity | Pipeline stages, probability, forecast |
| Activity | Call/Meeting/Email/Task scheduling |
| Quote | Line items, tax calc, approval workflow |
| Campaign | Lead source / campaign attribution |
| SAP Analytics Cloud | Dashboard charts and KPIs |
| SAP Fiori | Design language and UX patterns |

---
