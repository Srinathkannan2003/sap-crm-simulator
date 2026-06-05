# User Guide

## SAP CRM Sales Process Simulator

---

## Getting Started

### Logging In

1. Open the application at `http://localhost:4200`
2. You will see the SAP CRM Login page
3. Use one of the demo accounts:

| Role | Username | Password | Access Level |
|---|---|---|---|
| Sales Manager | `manager` | `manager123` | Full access + quote approval |
| Sales Rep | `rep1` | `rep123` | Standard sales access |
| Sales Rep | `rep2` | `rep123` | Standard sales access |

4. Click **Sign In** or use the **Quick Demo Access** buttons

---

## Navigation

The left sidebar contains all main navigation items:

| Icon | Section | Description |
|---|---|---|
| 🏠 | Dashboard | KPIs, charts, activity feed |
| 👥 | Business Partners | Customer management |
| 🎯 | Lead Management | Lead lifecycle |
| 📈 | Opportunities | Sales pipeline |
| 📅 | Activities | Calls, meetings, tasks |
| 💰 | Quotes | Quote builder + approval |
| 📊 | Reports | Analytics + exports |

---

## Dashboard

The Dashboard gives you an at-a-glance view of your sales health.

### KPI Cards
- **Total Customers** — all active business partners
- **Open Leads** — leads in New or Qualified status
- **Converted Leads** — leads successfully converted to opportunities
- **Open Opportunities** — deals not yet closed
- **Revenue Pipeline** — weighted forecast value (revenue × probability)
- **Active Quotes** — quotes in Draft or Submitted status

### Charts
- **Lead Status Distribution** — doughnut showing New/Qualified/Converted/Lost
- **Opportunity Pipeline by Stage** — bar chart of revenue per stage
- **Revenue Forecast** — monthly line chart

### Widgets
- **Upcoming Activities** — next 6 scheduled activities
- **Top Opportunities** — top 6 by expected revenue

---

## Business Partner Management

### Viewing Customers
1. Click **Business Partners** in the sidebar
2. Browse the paginated table (10 rows default)
3. Use the **Search** box to filter by name, email, or city
4. Use **Industry**, **Type**, or **Status** dropdowns to filter
5. Click any column header to sort

### Creating a Customer
1. Click **New Customer** (top right)
2. Fill in required fields: Name, Email, Industry, Account Type
3. Optionally add address, revenue, employees, notes
4. Click **Create Customer**

### Editing a Customer
1. Click the edit ✏️ icon in the table row, or
2. Open the customer detail and click **Edit**

### Viewing Customer Detail (360° View)
1. Click on the customer name in the table
2. See contact info, revenue stats, and related data tabs:
   - **Leads** tab — all leads for this customer
   - **Opportunities** tab — all opportunities
   - **Activities** tab — all logged interactions

### Exporting Customers
Click **Export** to download a CSV of the filtered/visible customers.

---

## Lead Management

### Viewing Leads
1. Click **Lead Management** in the sidebar
2. Use the **status chips** at the top to filter quickly (All / New / Qualified / Converted / Lost)
3. Use Search, Priority, and Sales Rep filters for more specific filtering

### Creating a Lead
1. Click **New Lead**
2. Select the Customer (required)
3. Fill in Title, Source, Status, Priority
4. Add Contact Person details
5. Enter Estimated Value
6. Click **Create Lead**

### Converting a Lead to Opportunity
1. Open a **Qualified** lead
2. Click **Convert to Opportunity** (blue button top right)
3. The lead status changes to **Converted**
4. A linked Opportunity ID is generated
5. Click **View Opportunity** in the snackbar notification

### Editing Lead Status
Open the lead → click **Edit** → change the **Status** dropdown → save.

---

## Opportunity Management

### List View vs Pipeline View
Toggle between views using the button in the top right:
- **List View** — tabular view with all details
- **Pipeline View** — Kanban board with columns per stage

### Creating an Opportunity
1. Click **New Opportunity**
2. Link to a Customer (required)
3. Select Stage → probability is auto-suggested
4. Set Expected Revenue and Close Date
5. Add product names, competitor info, next steps
6. Click **Create Opportunity**

### Updating Opportunity Stage
Open an opportunity → click **Edit** → change the Stage. The probability field updates automatically.

### Pipeline Kanban View
- Each column represents a stage
- Cards show title, customer, revenue, and probability %
- Click any card to open the detail view
- Column headers show count and total revenue per stage

---

## Activity Management

### Scheduling an Activity
1. Click **Schedule Activity**
2. Select **Activity Type**: Call / Meeting / Email / Task
3. Enter Subject (required)
4. Link to a Customer and/or Opportunity
5. Set Due Date, Duration, Priority, and Assigned Rep
6. Click **Schedule Activity**

### Completing an Activity
1. Find the activity in the list
2. Click the **Complete** button
3. Enter outcome notes in the prompt dialog
4. The activity moves to **Completed** status

### Filtering Activities
Use the **type buttons** (Call / Meeting / Email / Task) to filter by type, plus the Status and Priority dropdowns.

---

## Quote Management

### Creating a Quote
1. Click **New Quote**
2. Select a Customer and assign a Rep
3. Set Valid Until date and Tax Rate
4. Click **Add Product** to add line items:
   - Select from product catalog, or choose **Custom Item**
   - Set Quantity, verify Unit Price, and set Discount %
   - Line total auto-calculates
5. Review the Totals panel (subtotal, discount, tax, grand total)
6. Add Notes/Terms
7. Click **Create Quote**

### Quote Approval Workflow

**As a Sales Rep:**
1. Open a Draft quote
2. Click **Submit** to submit for manager approval
3. Status changes to **Submitted**

**As a Sales Manager:**
1. Open a Submitted quote
2. Click **Approve** ✅ or **Reject** ❌
3. Approved quotes display a green approval stamp with your name

### Printing a Quote
1. Open any quote detail view
2. Click **Print** to open the browser print dialog
3. The sidebar and header are hidden in the print layout

---

## Reports

### Navigating Reports
Click **Reports** in the sidebar. Three tabs are available:
- 📊 **Lead Report** — lead performance analysis
- 📈 **Opportunity Report** — pipeline and win/loss analysis
- 💰 **Revenue Report** — forecast and per-rep revenue

### Changing the Period
Use the **Period** dropdown (Q3 / Q4 / YTD) to filter data.

### Exporting Data
Click **Export CSV** to download the current opportunity data as a spreadsheet.

---

## Tips & Best Practices

- **Dashboard first** — start every morning by reviewing the Dashboard
- **Log every interaction** — create an Activity for every call, email, and meeting
- **Update opportunity stages** as deals progress to keep the pipeline accurate
- **Convert qualified leads** promptly so opportunities appear in the pipeline
- **Submit quotes for approval** before sending to customers
- **Check Reports weekly** to track your conversion rates and pipeline health
