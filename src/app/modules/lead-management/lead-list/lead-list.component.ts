import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeadService } from '../../../core/services/lead.service';
import { Lead } from '../../../core/models';

@Component({
  selector: 'app-lead-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, RouterLink, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatPaginatorModule, MatTooltipModule, MatSnackBarModule
  ],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">Lead Management</h1>
      <p class="page-subtitle">{{ allLeads().length }} total · {{ newCount() }} new · {{ qualCount() }} qualified</p>
    </div>
    <div class="page-actions">
      <button mat-flat-button color="primary" routerLink="new">
        <mat-icon>add</mat-icon> New Lead
      </button>
    </div>
  </div>

  <!-- Status summary chips -->
  <div class="status-summary">
    @for (s of statusSummary(); track s.label) {
      <button class="summary-chip" [class.active]="filterStatus===s.value" (click)="setStatus(s.value)"
              [style.--chip-color]="s.color">
        <span class="chip-count">{{ s.count }}</span>
        <span class="chip-label">{{ s.label }}</span>
      </button>
    }
  </div>

  <div class="table-container">
    <div class="table-toolbar">
      <mat-form-field appearance="outline" class="search-field">
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()" placeholder="Search leads…">
        @if (searchQuery) {
          <button matSuffix mat-icon-button (click)="searchQuery='';applyFilter()"><mat-icon>close</mat-icon></button>
        }
      </mat-form-field>
      <mat-form-field appearance="outline" style="width:130px">
        <mat-label>Priority</mat-label>
        <mat-select [(ngModel)]="filterPriority" (ngModelChange)="applyFilter()">
          <mat-option value="">All</mat-option>
          <mat-option value="Critical">Critical</mat-option>
          <mat-option value="High">High</mat-option>
          <mat-option value="Medium">Medium</mat-option>
          <mat-option value="Low">Low</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" style="width:160px">
        <mat-label>Sales Rep</mat-label>
        <mat-select [(ngModel)]="filterRep" (ngModelChange)="applyFilter()">
          <mat-option value="">All Reps</mat-option>
          <mat-option value="James Chen">James Chen</mat-option>
          <mat-option value="Priya Patel">Priya Patel</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <table mat-table [dataSource]="pagedData()">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>Lead ID</th>
        <td mat-cell *matCellDef="let r"><span class="font-mono text-muted">{{ r.id }}</span></td>
      </ng-container>

      <ng-container matColumnDef="title">
        <th mat-header-cell *matHeaderCellDef>Title</th>
        <td mat-cell *matCellDef="let r">
          <a [routerLink]="[r.id]" class="lead-link">{{ r.title }}</a>
          <div class="sub-text">{{ r.contactName }}</div>
        </td>
      </ng-container>

      <ng-container matColumnDef="customerName">
        <th mat-header-cell *matHeaderCellDef>Customer</th>
        <td mat-cell *matCellDef="let r">{{ r.customerName }}</td>
      </ng-container>

      <ng-container matColumnDef="source">
        <th mat-header-cell *matHeaderCellDef>Source</th>
        <td mat-cell *matCellDef="let r">{{ r.source }}</td>
      </ng-container>

      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let r">
          <span class="status-badge" [class]="r.status.toLowerCase()">{{ r.status }}</span>
        </td>
      </ng-container>

      <ng-container matColumnDef="priority">
        <th mat-header-cell *matHeaderCellDef>Priority</th>
        <td mat-cell *matCellDef="let r">
          <span class="status-badge" [class]="r.priority.toLowerCase()">{{ r.priority }}</span>
        </td>
      </ng-container>

      <ng-container matColumnDef="estimatedValue">
        <th mat-header-cell *matHeaderCellDef>Est. Value</th>
        <td mat-cell *matCellDef="let r" class="text-right font-mono">{{ r.estimatedValue | currency:'USD':'symbol':'1.0-0' }}</td>
      </ng-container>

      <ng-container matColumnDef="assignedRep">
        <th mat-header-cell *matHeaderCellDef>Assigned To</th>
        <td mat-cell *matCellDef="let r">{{ r.assignedRep }}</td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let r">
          <div class="row-actions">
            <button mat-icon-button [routerLink]="[r.id]" matTooltip="View"><mat-icon>visibility</mat-icon></button>
            <button mat-icon-button [routerLink]="[r.id,'edit']" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button (click)="deleteLead(r)" matTooltip="Delete" color="warn"><mat-icon>delete</mat-icon></button>
          </div>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let r; columns: cols;"></tr>
      <tr class="mat-row" *matNoDataRow>
        <td [attr.colspan]="cols.length">
          <div class="empty-state"><mat-icon>track_changes</mat-icon><p>No leads found</p></div>
        </td>
      </tr>
    </table>

    <mat-paginator [length]="filtered().length" [pageSize]="pageSize" [pageSizeOptions]="[10,25,50]"
      (page)="onPage($event)" showFirstLastButtons></mat-paginator>
  </div>
</div>
  `,
  styles: [`
    .status-summary { display: flex; gap: .625rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .summary-chip { display: flex; flex-direction: column; align-items: center; padding: .625rem 1.25rem; border: 2px solid var(--border-color); border-radius: var(--radius-md); background: white; cursor: pointer; transition: all 140ms;
      &.active, &:hover { border-color: var(--chip-color, var(--sap-blue)); background: color-mix(in srgb, var(--chip-color, var(--sap-blue)) 8%, white); }
      .chip-count { font-size: 1.286rem; font-weight: 700; line-height: 1; color: var(--chip-color, var(--sap-blue)); }
      .chip-label { font-size: .714rem; color: var(--text-secondary); font-weight: 500; }
    }
    .lead-link { font-weight: 600; color: var(--sap-blue); }
    .sub-text { font-size: .75rem; color: var(--text-secondary); }
    .text-muted { color: var(--text-secondary); font-size: .786rem; }
    .row-actions { display: flex; opacity: 0; transition: opacity var(--transition); }
    tr:hover .row-actions { opacity: 1; }
  `]
})
export class LeadListComponent implements OnInit {
  allLeads = signal<Lead[]>([]);
  filtered = signal<Lead[]>([]);

  searchQuery = '';
  filterStatus = '';
  filterPriority = '';
  filterRep = '';
  pageSize = 10;
  pageIndex = 0;

  cols = ['id', 'title', 'customerName', 'source', 'status', 'priority', 'estimatedValue', 'assignedRep', 'actions'];

  newCount = computed(() => this.allLeads().filter(l => l.status === 'New').length);
  qualCount = computed(() => this.allLeads().filter(l => l.status === 'Qualified').length);

  pagedData = computed(() => {
    const s = this.pageIndex * this.pageSize;
    return this.filtered().slice(s, s + this.pageSize);
  });

  statusSummary = computed(() => [
    { label: 'All', value: '', count: this.allLeads().length, color: '#6a7177' },
    { label: 'New', value: 'New', count: this.allLeads().filter(l => l.status === 'New').length, color: '#0a6ed1' },
    { label: 'Qualified', value: 'Qualified', count: this.allLeads().filter(l => l.status === 'Qualified').length, color: '#e8a000' },
    { label: 'Converted', value: 'Converted', count: this.allLeads().filter(l => l.status === 'Converted').length, color: '#107e3e' },
    { label: 'Lost', value: 'Lost', count: this.allLeads().filter(l => l.status === 'Lost').length, color: '#bb0000' },
  ]);

  constructor(private leadSvc: LeadService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.leadSvc.getLeads().subscribe(data => {
      this.allLeads.set(data);
      this.filtered.set(data);
    });
  }

  setStatus(v: string): void { this.filterStatus = v; this.applyFilter(); }

  applyFilter(): void {
    let d = [...this.allLeads()];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      d = d.filter(l => l.title.toLowerCase().includes(q) || l.customerName.toLowerCase().includes(q) || l.contactName.toLowerCase().includes(q));
    }
    if (this.filterStatus) d = d.filter(l => l.status === this.filterStatus);
    if (this.filterPriority) d = d.filter(l => l.priority === this.filterPriority);
    if (this.filterRep) d = d.filter(l => l.assignedRep === this.filterRep);
    this.filtered.set(d);
    this.pageIndex = 0;
  }

  onPage(e: PageEvent): void { this.pageSize = e.pageSize; this.pageIndex = e.pageIndex; }

  deleteLead(lead: Lead): void {
    if (!confirm(`Delete lead "${lead.title}"?`)) return;
    this.leadSvc.deleteLead(lead.id).subscribe(() => {
      this.allLeads.update(l => l.filter(x => x.id !== lead.id));
      this.applyFilter();
      this.snackBar.open('Lead deleted', 'Dismiss', { duration: 3000 });
    });
  }
}
