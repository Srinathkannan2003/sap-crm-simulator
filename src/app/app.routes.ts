import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard | SAP CRM'
      },
      {
        path: 'customers',
        loadChildren: () => import('./modules/business-partner/bp.routes').then(m => m.bpRoutes),
        title: 'Business Partners | SAP CRM'
      },
      {
        path: 'leads',
        loadChildren: () => import('./modules/lead-management/lead.routes').then(m => m.leadRoutes),
        title: 'Lead Management | SAP CRM'
      },
      {
        path: 'opportunities',
        loadChildren: () => import('./modules/opportunity/opportunity.routes').then(m => m.opportunityRoutes),
        title: 'Opportunities | SAP CRM'
      },
      {
        path: 'activities',
        loadChildren: () => import('./modules/activity/activity.routes').then(m => m.activityRoutes),
        title: 'Activities | SAP CRM'
      },
      {
        path: 'quotes',
        loadChildren: () => import('./modules/quotes/quote.routes').then(m => m.quoteRoutes),
        title: 'Quotes | SAP CRM'
      },
      {
        path: 'reports',
        loadChildren: () => import('./modules/reports/reports.routes').then(m => m.reportsRoutes),
        title: 'Reports | SAP CRM'
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
