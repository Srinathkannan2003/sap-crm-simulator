import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivityService } from '../../../core/services/activity.service';
import { Activity, ActivityType } from '../../../core/models';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatTabsModule,
    MatMenuModule, MatSnackBarModule, MatDialogModule, MatTooltipModule
  ],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">Activity Management</h1>
      <p class="page-subtitle">{{ allActivities().length }} activities · {{ pendingCount() }} pending</p>
    </div>
    <div class="page-actions">
      <button mat-flat-button color="primary" routerLink="new">
        <mat-icon>add</mat-icon> Schedule Activity
      </button>
    </div>
  </div>

  <!-- Type filter tabs -->
  <div class="type-filter-row">
    <button class="type-btn" [class.active]="filterType===''"
      (click)="setType('')">
      <mat-icon>list</mat-icon> All
    </button>
    @for (t of types; track t.key) {
      <button class="type-btn" [class.active]="filterType===t.key"
        [class]="filterType===t.key?'type-btn active '+t.key:'type-btn '+t.key"
        (click)="setType(t.key)">
        <mat-icon>{{ t.icon }}</mat-icon> {{ t.key }}
      </button>
    }
  </div>

  <div class="table-container">
    <div class="table-toolbar">
      <mat-form-field appearance="outline" class="search-field">
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="search" (ngModelChange)="applyFilter()" placeholder="Search activities…">
      </mat-form-field>
      <mat-form-field appearance="outline" style="width:140px">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()">
          <mat-option value="">All</mat-option>
          <mat-option value="Scheduled">Scheduled</mat-option>
          <mat-option value="In Progress">In Progress</mat-option>
          <mat-option value="Completed">Completed</mat-option>
          <mat-option value="Cancelled">Cancelled</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" style="width:140px">
        <mat-label>Priority</mat-label>
        <mat-select [(ngModel)]="filterPriority" (ngModelChange)="applyFilter()">
          <mat-option value="">All</mat-option>
          <mat-option value="Critical">Critical</mat-option>
          <mat-option value="High">High</mat-option>
          <mat-option value="Medium">Medium</mat-option>
          <mat-option value="Low">Low</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <div class="activity-cards">
      @if (!filtered().length) {
        <div class="empty-state"><mat-icon>event_busy</mat-icon><p>No activities found</p></div>
      }
      @for (act of filtered(); track act.id) {
        <div class="activity-card" [class.completed]="act.status==='Completed'">
          <div class="act-type-badge" [class]="act.type.toLowerCase()">
            <mat-icon>{{ typeIcon(act.type) }}</mat-icon>
            <span>{{ act.type }}</span>
          </div>

          <div class="act-main">
            <div class="act-title">{{ act.subject }}</div>
            <div class="act-sub">{{ act.customerName }} · {{ act.dueDate }}</div>
            @if (act.description) {
              <div class="act-desc">{{ act.description }}</div>
            }
          </div>

          <div class="act-meta-col">
            <span class="status-badge" [class]="act.status.toLowerCase().replace(' ','-')">{{ act.status }}</span>
            <span class="status-badge" [class]="act.priority.toLowerCase()">{{ act.priority }}</span>
            <span class="act-rep">{{ act.assignedTo }}</span>
            @if (act.duration) { <span class="act-dur"><mat-icon>schedule</mat-icon>{{ act.duration }}m</span> }
          </div>

          <div class="act-actions">
            @if (act.status !== 'Completed' && act.status !== 'Cancelled') {
              <button mat-stroked-button (click)="completeActivity(act)">
                <mat-icon>check</mat-icon> Complete
              </button>
            }
            <button mat-icon-button [routerLink]="[act.id,'edit']" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button (click)="deleteActivity(act)" color="warn" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
          </div>
        </div>
      }
    </div>
  </div>
</div>
  `,
  styles: [`
    .type-filter-row { display: flex; gap: .5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .type-btn { display: flex; align-items: center; gap: .375rem; padding: .375rem .875rem; border: 1px solid var(--border-color); border-radius: 20px; background: white; cursor: pointer; font-size: .857rem; font-weight: 500; color: var(--text-secondary); transition: all 140ms;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &.active, &:hover { background: var(--sap-blue); color: white; border-color: var(--sap-blue); }
    }
    .activity-cards { display: flex; flex-direction: column; }
    .activity-card { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-subtle); transition: background var(--transition);
      &:hover { background: #f8fbff; }
      &.completed { opacity: .65; }
      &:last-child { border-bottom: none; }
    }
    .act-type-badge { display: flex; flex-direction: column; align-items: center; gap: 3px; width: 56px; flex-shrink: 0;
      mat-icon { font-size: 22px; width: 22px; height: 22px; padding: .5rem; border-radius: 8px; }
      span { font-size: .643rem; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: var(--text-secondary); }
      &.call mat-icon { background: #e8f1fb; color: var(--sap-blue); }
      &.meeting mat-icon { background: var(--sap-green-light); color: var(--sap-green); }
      &.email mat-icon { background: #fef7e6; color: var(--sap-gold); }
      &.task mat-icon { background: #f0ebff; color: #6b3fa0; }
    }
    .act-main { flex: 1; min-width: 0; }
    .act-title { font-size: .929rem; font-weight: 600; margin-bottom: 3px; }
    .act-sub { font-size: .786rem; color: var(--text-secondary); margin-bottom: .25rem; }
    .act-desc { font-size: .8rem; color: var(--text-secondary); line-height: 1.4; }
    .act-meta-col { display: flex; flex-direction: column; align-items: flex-end; gap: .375rem; min-width: 110px; }
    .act-rep { font-size: .75rem; color: var(--text-secondary); }
    .act-dur { display: flex; align-items: center; gap: 3px; font-size: .75rem; color: var(--text-secondary); mat-icon { font-size: 14px; width: 14px; height: 14px; } }
    .act-actions { display: flex; align-items: center; gap: .25rem; flex-shrink: 0; }
  `]
})
export class ActivityListComponent implements OnInit {
  allActivities = signal<Activity[]>([]);
  filtered = signal<Activity[]>([]);

  search = '';
  filterType = '';
  filterStatus = '';
  filterPriority = '';

  types = [
    { key: 'Call', icon: 'phone' },
    { key: 'Meeting', icon: 'people' },
    { key: 'Email', icon: 'email' },
    { key: 'Task', icon: 'task_alt' },
  ];

  pendingCount = computed(() =>
    this.allActivities().filter(a => a.status === 'Scheduled' || a.status === 'In Progress').length
  );

  constructor(private actSvc: ActivityService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.actSvc.getActivities().subscribe(d => {
      this.allActivities.set(d);
      this.filtered.set(d);
    });
  }

  setType(t: string): void { this.filterType = t; this.applyFilter(); }

  applyFilter(): void {
    let d = [...this.allActivities()];
    if (this.search) {
      const q = this.search.toLowerCase();
      d = d.filter(a => a.subject.toLowerCase().includes(q) || a.customerName.toLowerCase().includes(q));
    }
    if (this.filterType) d = d.filter(a => a.type === this.filterType);
    if (this.filterStatus) d = d.filter(a => a.status === this.filterStatus);
    if (this.filterPriority) d = d.filter(a => a.priority === this.filterPriority);
    this.filtered.set(d);
  }

  typeIcon(type: string): string {
    return { Call: 'phone', Meeting: 'people', Email: 'email', Task: 'task_alt' }[type] ?? 'event';
  }

  completeActivity(act: Activity): void {
    const outcome = prompt('Enter outcome / notes (optional):') ?? '';
    this.actSvc.completeActivity(act.id, outcome).subscribe(() => {
      this.allActivities.update(list => list.map(a => a.id === act.id ? { ...a, status: 'Completed', outcome, completedDate: new Date().toISOString().split('T')[0] } : a));
      this.applyFilter();
      this.snackBar.open('Activity completed', 'Dismiss', { duration: 3000 });
    });
  }

  deleteActivity(act: Activity): void {
    if (!confirm(`Delete activity "${act.subject}"?`)) return;
    this.actSvc.deleteActivity(act.id).subscribe(() => {
      this.allActivities.update(l => l.filter(a => a.id !== act.id));
      this.applyFilter();
      this.snackBar.open('Activity deleted', 'Dismiss', { duration: 3000 });
    });
  }
}
