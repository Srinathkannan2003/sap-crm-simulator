# Functional Specification

## SAP CRM Sales Process Simulator v1.0

---

## 1. System Overview

The SAP CRM Sales Process Simulator is a single-page Angular application that simulates the SAP CRM sales workflow. It provides full CRUD operations across six business objects, a KPI dashboard, and a reports module — all backed by a JSON Server mock REST API.

---

## 2. User Roles

### 2.1 Sales Manager
- Full read/write access to all modules
- Can approve or reject quotes
- Sees all customers, leads, and opportunities regardless of assignment
- Access to full Reports module

### 2.2 Sales Representative
- Full CRUD on assigned customers, leads, opportunities, activities
- Can create and submit quotes (cannot approve)
- Access to Reports (read-only)

---

## 3. Module Specifications

### 3.1 Authentication Module

**Screens:** Login Page

**Functional Requirements:**
- FR-AUTH-01: User must provide username and password to log in
- FR-AUTH-02: Invalid credentials display an error message
- FR-AUTH-03: Successful login redirects to Dashboard
- FR-AUTH-04: Session persists across page reloads (sessionStorage)
- FR-AUTH-05: Logout clears session and redirects to login
- FR-AUTH-06: Quick-access demo buttons for all 3 demo users
- FR-AUTH-07: All routes (except login) require authentication

---

### 3.2 Dashboard Module

**Screens:** Dashboard

**KPI Cards:**
| KPI | Calculation |
|---|---|
| Total Customers | COUNT(customers) |
| Open Leads | COUNT(leads WHERE status IN ('New','Qualified')) |
| Converted Leads | COUNT(leads WHERE status='Converted') |
| Open Opportunities | COUNT(opps WHERE stage NOT IN ('Closed Won','Closed Lost')) |
| Revenue Pipeline | SUM(opp.expectedRevenue * opp.probability/100) for open opps |
| Active Quotes | COUNT(quotes WHERE status IN ('Draft','Submitted')) |

**Charts:**
- Lead Status Distribution: Doughnut by status
- Opportunity Pipeline: Bar by stage (revenue value)
- Revenue Forecast: Line chart (monthly)

**Other Widgets:**
- Upcoming Activities: Top 6 non-completed, sorted by dueDate
- Top Opportunities: Top 6 open opps by expectedRevenue

---

### 3.3 Business Partner Module

**Screens:** List, Create, Edit, Detail

**Functional Requirements:**
- FR-BP-01: Display paginated customer list (10 per page default)
- FR-BP-02: Search by name, email, ID, or city
- FR-BP-03: Filter by industry, account type, status
- FR-BP-04: Sort any column ascending/descending
- FR-BP-05: Create new customer with all required fields
- FR-BP-06: Edit existing customer details
- FR-BP-07: Delete customer with confirmation dialog
- FR-BP-08: Detail view shows customer info + related Leads, Opps, Activities
- FR-BP-09: Export filtered list to CSV

**Required Fields:** Name, Email, Industry, Account Type

---

### 3.4 Lead Management Module

**Screens:** List, Create, Edit, Detail

**Functional Requirements:**
- FR-LEAD-01: Display lead list with status summary chips
- FR-LEAD-02: Filter by status, priority, assigned rep
- FR-LEAD-03: Search by title, customer name, contact name
- FR-LEAD-04: Create lead with customer linkage
- FR-LEAD-05: Edit lead details including status
- FR-LEAD-06: Delete lead with confirmation
- FR-LEAD-07: Detail view shows status timeline progression
- FR-LEAD-08: "Convert to Opportunity" button for Qualified leads
- FR-LEAD-09: Converted leads show link to resulting Opportunity
- FR-LEAD-10: Priority badges (Low/Medium/High/Critical)

**Status Transitions:**
```
New → Qualified (manual update)
Qualified → Converted (via Convert button)
Any → Lost (manual update)
```

---

### 3.5 Opportunity Management Module

**Screens:** List (List/Kanban toggle), Create, Edit, Detail

**Functional Requirements:**
- FR-OPP-01: Toggle between list view and Kanban pipeline view
- FR-OPP-02: Kanban shows columns for all 6 stages with count + total
- FR-OPP-03: Filter by stage, assigned rep; search by title/customer
- FR-OPP-04: Create opportunity with customer linkage and stage selection
- FR-OPP-05: Auto-suggest probability when stage changes
- FR-OPP-06: Edit all opportunity fields
- FR-OPP-07: Delete opportunity with confirmation
- FR-OPP-08: Detail view shows stage pipeline indicator
- FR-OPP-09: Related activities panel on detail view
- FR-OPP-10: Products/Solutions chip list on detail view
- FR-OPP-11: "Create Quote" button on detail view navigates to quote form
- FR-OPP-12: Weighted pipeline value = expectedRevenue × probability/100

---

### 3.6 Activity Management Module

**Screens:** List, Create/Schedule, Edit

**Functional Requirements:**
- FR-ACT-01: Display activity list with type icons (Call/Meeting/Email/Task)
- FR-ACT-02: Filter by type (tab buttons), status, priority
- FR-ACT-03: Search by subject or customer name
- FR-ACT-04: Schedule new activity with customer and opportunity linkage
- FR-ACT-05: "Complete" button prompts for outcome notes
- FR-ACT-06: Completed activities show muted styling
- FR-ACT-07: Edit all activity fields
- FR-ACT-08: Delete activity with confirmation
- FR-ACT-09: Duration tracked in minutes

---

### 3.7 Quote Management Module

**Screens:** List, Create, Edit, Detail (printable)

**Functional Requirements:**
- FR-QUOTE-01: Status summary chips: All / Draft / Submitted / Approved / Rejected
- FR-QUOTE-02: Create quote with dynamic line items from product catalog
- FR-QUOTE-03: Auto-calculate line total = qty × unitPrice × (1 − discount%)
- FR-QUOTE-04: Auto-calculate subtotal, discount total, tax, grand total
- FR-QUOTE-05: Configurable tax rate per quote
- FR-QUOTE-06: Submit Draft → Submitted (Sales Rep)
- FR-QUOTE-07: Approve Submitted → Approved (Manager only)
- FR-QUOTE-08: Reject Submitted → Rejected (Manager only)
- FR-QUOTE-09: Detail view renders printable quote document
- FR-QUOTE-10: Print button triggers browser print dialog
- FR-QUOTE-11: Approval stamp displayed on Approved quotes
- FR-QUOTE-12: Custom line item entry (in addition to catalog products)

---

### 3.8 Reports Module

**Screens:** Reports (tabbed: Lead / Opportunity / Revenue)

**Functional Requirements:**
- FR-RPT-01: Lead Report: status doughnut, industry bar, source value bar
- FR-RPT-02: Opportunity Report: stage doughnut, revenue bar, win/loss bar
- FR-RPT-03: Revenue Report: monthly forecast line, per-rep bar, quote value bar
- FR-RPT-04: Revenue Summary table by sales rep
- FR-RPT-05: Period filter (Q3 / Q4 / YTD)
- FR-RPT-06: Export current opportunity data to CSV

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Initial load < 3s on dev server |
| Responsive | Usable on 375px mobile to 1920px desktop |
| Accessibility | ARIA labels on all interactive elements |
| TypeScript | Strict mode enabled (`"strict": true`) |
| Change Detection | OnPush throughout for performance |
| Code Quality | No any types; all interfaces defined in core/models |
| Lazy Loading | All feature modules lazy-loaded via loadComponent/loadChildren |
| Signals | Auth state, component local state use Angular Signals |
