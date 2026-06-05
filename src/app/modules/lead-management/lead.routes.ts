import { Routes } from '@angular/router';

export const leadRoutes: Routes = [
  { path: '', loadComponent: () => import('./lead-list/lead-list.component').then(m => m.LeadListComponent) },
  { path: 'new', loadComponent: () => import('./lead-form/lead-form.component').then(m => m.LeadFormComponent) },
  { path: ':id', loadComponent: () => import('./lead-detail/lead-detail.component').then(m => m.LeadDetailComponent) },
  { path: ':id/edit', loadComponent: () => import('./lead-form/lead-form.component').then(m => m.LeadFormComponent) }
];
