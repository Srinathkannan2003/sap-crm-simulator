import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models';

@Component({
  selector: 'app-bp-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, RouterLink, FormsModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatSelectModule, MatTooltipModule,
    MatMenuModule, MatSnackBarModule, MatDialogModule
  ],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">Business Partners</h1>
      <p class="page-subtitle">{{ allCustomers().length }} customers · {{ activeCount() }} active</p>
    </div>
    <div class="page-actions">
      <button mat-stroked-button (click)="exportCsv()">
        <mat-icon>download</mat-icon> Export
      </button>
      <button mat-flat-button color="primary" routerLink="new">
        <mat-icon>add</mat-icon> New Customer
      </button>
    </div>
  </div>

  <div class="table-container">
    <div class="table-toolbar">
      <mat-form-field appearance="outline" class="search-field">
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()" placeholder="Search customers…">
        @if (searchQuery) {
          <button matSuffix mat-icon-button (click)="clearSearch()"><mat-icon>close</mat-icon></button>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:160px">
        <mat-label>Industry</mat-label>
        <mat-select [(ngModel)]="filterIndustry" (ngModelChange)="applyFilter()">
          <mat-option value="">All Industries</mat-option>
          @for (ind of industries; track ind) {
            <mat-option [value]="ind">{{ ind }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:140px">
        <mat-label>Type</mat-label>
        <mat-select [(ngModel)]="filterType" (ngModelChange)="applyFilter()">
          <mat-option value="">All Types</mat-option>
          <mat-option value="Enterprise">Enterprise</mat-option>
          <mat-option value="Mid-Market">Mid-Market</mat-option>
          <mat-option value="SMB">SMB</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:130px">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()">
          <mat-option value="">All</mat-option>
          <mat-option value="Active">Active</mat-option>
          <mat-option value="Inactive">Inactive</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <table mat-table [dataSource]="pagedData()" matSort (matSortChange)="onSort($event)">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
        <td mat-cell *matCellDef="let row">
          <span class="font-mono" style="font-size:.786rem;color:var(--text-secondary)">{{ row.id }}</span>
        </td>
      </ng-container>

      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
        <td mat-cell *matCellDef="let row">
          <a [routerLink]="[row.id]" class="customer-name-link">{{ row.name }}</a>
        </td>
      </ng-container>

      <ng-container matColumnDef="industry">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Industry</th>
        <td mat-cell *matCellDef="let row">{{ row.industry }}</td>
      </ng-container>

      <ng-container matColumnDef="accountType">
        <th mat-header-cell *matHeaderCellDef>Type</th>
        <td mat-cell *matCellDef="let row">
          <span class="status-badge" [class]="row.accountType.toLowerCase().replace('-','')">{{ row.accountType }}</span>
        </td>
      </ng-container>

      <ng-container matColumnDef="revenue">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Revenue</th>
        <td mat-cell *matCellDef="let row" class="text-right">{{ row.revenue | currency:'USD':'symbol':'1.0-0' }}</td>
      </ng-container>

      <ng-container matColumnDef="assignedRep">
        <th mat-header-cell *matHeaderCellDef>Sales Rep</th>
        <td mat-cell *matCellDef="let row">{{ row.assignedRep }}</td>
      </ng-container>

      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let row">
          <span class="status-badge" [class]="row.status.toLowerCase()">{{ row.status }}</span>
        </td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let row">
          <div class="row-actions">
            <button mat-icon-button [routerLink]="[row.id]" matTooltip="View"><mat-icon>visibility</mat-icon></button>
            <button mat-icon-button [routerLink]="[row.id, 'edit']" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button (click)="confirmDelete(row)" matTooltip="Delete" color="warn"><mat-icon>delete</mat-icon></button>
          </div>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

      <tr class="mat-row" *matNoDataRow>
        <td [attr.colspan]="displayedColumns.length">
          <div class="empty-state">
            <mat-icon>people_outline</mat-icon>
            <p>No customers found</p>
          </div>
        </td>
      </tr>
    </table>

    <mat-paginator
      [length]="filteredCustomers().length"
      [pageSize]="pageSize"
      [pageSizeOptions]="[10, 25, 50]"
      (page)="onPage($event)"
      showFirstLastButtons>
    </mat-paginator>
  </div>
</div>
  `,
  styles: [`
    .customer-name-link { font-weight: 600; color: var(--sap-blue); }
    .customer-name-link:hover { text-decoration: underline; }
    .row-actions { display: flex; opacity: 0; transition: opacity var(--transition); }
    tr:hover .row-actions { opacity: 1; }
    .status-badge.enterprise { background: #e8f1fb; color: var(--sap-blue); }
    .status-badge.midmarket { background: #fef7e6; color: var(--sap-gold); }
    .status-badge.smb { background: #f3f4f6; color: var(--text-secondary); }
  `]
})
export class BpListComponent implements OnInit {
  allCustomers = signal<Customer[]>([]);
  filteredCustomers = signal<Customer[]>([]);

  searchQuery = '';
  filterIndustry = '';
  filterType = '';
  filterStatus = '';
  pageSize = 10;
  pageIndex = 0;
  sortField = '';
  sortDir: 'asc' | 'desc' = 'asc';

  displayedColumns = ['id', 'name', 'industry', 'accountType', 'revenue', 'assignedRep', 'status', 'actions'];

  industries = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail',
    'Logistics', 'Energy', 'Aerospace', 'Automotive', 'Pharmaceuticals',
    'Telecommunications', 'Construction', 'Education', 'Food & Beverage', 'Agriculture'];

  activeCount = computed(() => this.allCustomers().filter(c => c.status === 'Active').length);

  pagedData = computed(() => {
    const start = this.pageIndex * this.pageSize;
    return this.filteredCustomers().slice(start, start + this.pageSize);
  });

  constructor(private customerSvc: CustomerService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.customerSvc.getCustomers().subscribe(data => {
      this.allCustomers.set(data);
      this.filteredCustomers.set(data);
    });
  }

  applyFilter(): void {
    let data = [...this.allCustomers()];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      data = data.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q)
      );
    }
    if (this.filterIndustry) data = data.filter(c => c.industry === this.filterIndustry);
    if (this.filterType) data = data.filter(c => c.accountType === this.filterType);
    if (this.filterStatus) data = data.filter(c => c.status === this.filterStatus);
    this.filteredCustomers.set(data);
    this.pageIndex = 0;
  }

  clearSearch(): void { this.searchQuery = ''; this.applyFilter(); }

  onSort(sort: Sort): void {
    if (!sort.active || sort.direction === '') { this.filteredCustomers.set([...this.allCustomers()]); return; }
    const sorted = [...this.filteredCustomers()].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sort.active];
      const bVal = (b as unknown as Record<string, unknown>)[sort.active];
      return (aVal! < bVal! ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
    });
    this.filteredCustomers.set(sorted);
  }

  onPage(e: PageEvent): void { this.pageSize = e.pageSize; this.pageIndex = e.pageIndex; }

  confirmDelete(customer: Customer): void {
    if (confirm(`Delete ${customer.name}? This cannot be undone.`)) {
      this.customerSvc.deleteCustomer(customer.id).subscribe(() => {
        this.allCustomers.update(list => list.filter(c => c.id !== customer.id));
        this.applyFilter();
        this.snackBar.open(`${customer.name} deleted`, 'Dismiss', { duration: 3000 });
      });
    }
  }

  exportCsv(): void {
    const rows = this.filteredCustomers();
    const header = 'ID,Name,Email,Phone,Industry,Type,Revenue,City,Status\n';
    const body = rows.map(r =>
      `${r.id},"${r.name}",${r.email},${r.phone},${r.industry},${r.accountType},${r.revenue},${r.city},${r.status}`
    ).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'customers.csv'; a.click();
  }
}
