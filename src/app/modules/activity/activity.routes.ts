import { Routes } from '@angular/router';

export const activityRoutes: Routes = [
  { path: '', loadComponent: () => import('./activity-list/activity-list.component').then(m => m.ActivityListComponent) },
  { path: 'new', loadComponent: () => import('./activity-form/activity-form.component').then(m => m.ActivityFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./activity-form/activity-form.component').then(m => m.ActivityFormComponent) }
];
