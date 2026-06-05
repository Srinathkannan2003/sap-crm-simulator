// =====================================================
// SAP CRM Sales Simulator - Core Models
// =====================================================

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'Sales Manager' | 'Sales Representative';
  name: string;
  email: string;
  avatar: string;
  region: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  industry: string;
  accountType: 'Enterprise' | 'Mid-Market' | 'SMB';
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  status: 'Active' | 'Inactive';
  revenue: number;
  employees: number;
  website: string;
  assignedRep: string;
  createdDate: string;
  notes: string;
}

export type LeadStatus = 'New' | 'Qualified' | 'Converted' | 'Lost';
export type LeadPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Lead {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  assignedRep: string;
  estimatedValue: number;
  description: string;
  createdDate: string;
  lastActivity: string;
  convertedOpportunityId: string | null;
  industry: string;
  campaign: string;
}

export type OpportunityStage =
  | 'Discovery'
  | 'Qualification'
  | 'Proposal'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost';

export interface Opportunity {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  leadId: string | null;
  stage: OpportunityStage;
  probability: number;
  expectedRevenue: number;
  expectedCloseDate: string;
  assignedRep: string;
  description: string;
  products: string[];
  competitorInfo: string;
  createdDate: string;
  lastActivity: string;
  nextSteps: string;
}

export type ActivityType = 'Call' | 'Meeting' | 'Email' | 'Task';
export type ActivityStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description: string;
  customerId: string | null;
  customerName: string;
  opportunityId: string | null;
  assignedTo: string;
  status: ActivityStatus;
  priority: LeadPriority;
  dueDate: string;
  completedDate: string | null;
  duration: number;
  outcome: string | null;
}

export type QuoteStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export interface QuoteLineItem {
  productId: string;
  product: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Quote {
  id: string;
  title: string;
  opportunityId: string;
  customerId: string;
  customerName: string;
  status: QuoteStatus;
  validUntil: string;
  createdDate: string;
  assignedRep: string;
  approvedBy: string | null;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes: string;
  lineItems: QuoteLineItem[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  unit: string;
}

export interface KpiCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: number;
  trendLabel?: string;
}

export interface PipelineData {
  stage: string;
  count: number;
  value: number;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'currency' | 'date' | 'badge' | 'number';
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  assignedRep?: string;
  industry?: string;
  dateFrom?: string;
  dateTo?: string;
}
