import { Routes } from '@angular/router';

export const bpRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./bp-list/bp-list.component').then(m => m.BpListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./bp-form/bp-form.component').then(m => m.BpFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./bp-detail/bp-detail.component').then(m => m.BpDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./bp-form/bp-form.component').then(m => m.BpFormComponent)
  }
];
