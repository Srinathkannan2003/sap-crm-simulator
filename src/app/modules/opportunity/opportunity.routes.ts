import { Routes } from '@angular/router';

export const opportunityRoutes: Routes = [
  { path: '', loadComponent: () => import('./opp-list/opp-list.component').then(m => m.OppListComponent) },
  { path: 'new', loadComponent: () => import('./opp-form/opp-form.component').then(m => m.OppFormComponent) },
  { path: ':id', loadComponent: () => import('./opp-detail/opp-detail.component').then(m => m.OppDetailComponent) },
  { path: ':id/edit', loadComponent: () => import('./opp-form/opp-form.component').then(m => m.OppFormComponent) }
];
