import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuoteService } from '../../../core/services/quote.service';
import { AuthService } from '../../../core/services/auth.service';
import { Quote } from '../../../core/models';

@Component({
  selector: 'app-quote-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatTableModule,
    MatSnackBarModule, MatTooltipModule
  ],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">Quote Management</h1>
      <p class="page-subtitle">{{ allQuotes().length }} quotes · Total value: {{ totalValue() | currency:'USD':'symbol':'1.0-0' }}</p>
    </div>
    <div class="page-actions">
      <button mat-flat-button color="primary" routerLink="new">
        <mat-icon>add</mat-icon> New Quote
      </button>
    </div>
  </div>

  <!-- Status summary -->
  <div class="status-summary">
    @for (s of statusSummary(); track s.label) {
      <button class="summary-chip" [class.active]="filterStatus===s.value"
        [style.--chip-color]="s.color" (click)="setStatus(s.value)">
        <span class="chip-count">{{ s.count }}</span>
        <span class="chip-label">{{ s.label }}</span>
      </button>
    }
  </div>

  <div class="table-container">
    <div class="table-toolbar">
      <mat-form-field appearance="outline" class="search-field">
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="search" (ngModelChange)="applyFilter()" placeholder="Search quotes…">
      </mat-form-field>
    </div>

    <table mat-table [dataSource]="filtered()">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>Quote ID</th>
        <td mat-cell *matCellDef="let r"><span class="font-mono" style="font-size:.786rem;color:var(--text-secondary)">{{ r.id }}</span></td>
      </ng-container>

      <ng-container matColumnDef="title">
        <th mat-header-cell *matHeaderCellDef>Title</th>
        <td mat-cell *matCellDef="let r">
          <a [routerLink]="[r.id]" class="quote-link">{{ r.title }}</a>
          <div style="font-size:.75rem;color:var(--text-secondary)">{{ r.customerName }}</div>
        </td>
      </ng-container>

      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let r">
          <span class="status-badge" [class]="r.status.toLowerCase()">{{ r.status }}</span>
        </td>
      </ng-container>

      <ng-container matColumnDef="total">
        <th mat-header-cell *matHeaderCellDef>Total</th>
        <td mat-cell *matCellDef="let r" class="text-right">
          <strong>{{ r.total | currency:'USD':'symbol':'1.0-0' }}</strong>
        </td>
      </ng-container>

      <ng-container matColumnDef="assignedRep">
        <th mat-header-cell *matHeaderCellDef>Rep</th>
        <td mat-cell *matCellDef="let r">{{ r.assignedRep }}</td>
      </ng-container>

      <ng-container matColumnDef="validUntil">
        <th mat-header-cell *matHeaderCellDef>Valid Until</th>
        <td mat-cell *matCellDef="let r">{{ r.validUntil }}</td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let r">
          <div class="row-actions">
            <button mat-icon-button [routerLink]="[r.id]" matTooltip="View"><mat-icon>visibility</mat-icon></button>
            @if (r.status === 'Draft') {
              <button mat-icon-button [routerLink]="[r.id,'edit']" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button (click)="submitQuote(r)" matTooltip="Submit for Approval" color="primary"><mat-icon>send</mat-icon></button>
            }
            @if (r.status === 'Submitted' && isManager()) {
              <button mat-icon-button (click)="approveQuote(r)" matTooltip="Approve" style="color:var(--sap-green)"><mat-icon>check_circle</mat-icon></button>
              <button mat-icon-button (click)="rejectQuote(r)" matTooltip="Reject" color="warn"><mat-icon>cancel</mat-icon></button>
            }
            <button mat-icon-button (click)="deleteQuote(r)" color="warn" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
          </div>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let r; columns: cols;"></tr>
      <tr class="mat-row" *matNoDataRow>
        <td [attr.colspan]="cols.length">
          <div class="empty-state"><mat-icon>request_quote</mat-icon><p>No quotes found</p></div>
        </td>
      </tr>
    </table>
  </div>
</div>
  `,
  styles: [`
    .status-summary { display:flex; gap:.625rem; margin-bottom:1.25rem; flex-wrap:wrap; }
    .summary-chip { display:flex; flex-direction:column; align-items:center; padding:.625rem 1.25rem; border:2px solid var(--border-color); border-radius:var(--radius-md); background:white; cursor:pointer; transition:all 140ms;
      &.active, &:hover { border-color:var(--chip-color,var(--sap-blue)); background:color-mix(in srgb,var(--chip-color,var(--sap-blue)) 8%,white); }
      .chip-count { font-size:1.286rem; font-weight:700; line-height:1; color:var(--chip-color,var(--sap-blue)); }
      .chip-label { font-size:.714rem; color:var(--text-secondary); font-weight:500; }
    }
    .quote-link { font-weight:600; color:var(--sap-blue); font-size:.875rem; }
    .row-actions { display:flex; opacity:0; transition:opacity var(--transition); }
    tr:hover .row-actions { opacity:1; }
  `]
})
export class QuoteListComponent implements OnInit {
  allQuotes = signal<Quote[]>([]);
  filtered = signal<Quote[]>([]);
  search = '';
  filterStatus = '';

  cols = ['id', 'title', 'status', 'total', 'assignedRep', 'validUntil', 'actions'];

  totalValue = computed(() => this.filtered().reduce((s, q) => s + q.total, 0));

  statusSummary = computed(() => [
    { label: 'All', value: '', count: this.allQuotes().length, color: '#6a7177' },
    { label: 'Draft', value: 'Draft', count: this.allQuotes().filter(q => q.status === 'Draft').length, color: '#0a6ed1' },
    { label: 'Submitted', value: 'Submitted', count: this.allQuotes().filter(q => q.status === 'Submitted').length, color: '#e8a000' },
    { label: 'Approved', value: 'Approved', count: this.allQuotes().filter(q => q.status === 'Approved').length, color: '#107e3e' },
    { label: 'Rejected', value: 'Rejected', count: this.allQuotes().filter(q => q.status === 'Rejected').length, color: '#bb0000' },
  ]);

  isManager = this.authSvc.isManager;

  constructor(
    private quoteSvc: QuoteService,
    private authSvc: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.quoteSvc.getQuotes().subscribe(d => { this.allQuotes.set(d); this.filtered.set(d); });
  }

  setStatus(v: string): void { this.filterStatus = v; this.applyFilter(); }

  applyFilter(): void {
    let d = [...this.allQuotes()];
    if (this.search) {
      const q = this.search.toLowerCase();
      d = d.filter(x => x.title.toLowerCase().includes(q) || x.customerName.toLowerCase().includes(q) || x.id.toLowerCase().includes(q));
    }
    if (this.filterStatus) d = d.filter(x => x.status === this.filterStatus);
    this.filtered.set(d);
  }

  submitQuote(q: Quote): void {
    this.quoteSvc.submitQuote(q.id).subscribe(() => {
      this.allQuotes.update(l => l.map(x => x.id === q.id ? { ...x, status: 'Submitted' } : x));
      this.applyFilter();
      this.snackBar.open('Quote submitted for approval', 'Dismiss', { duration: 3000 });
    });
  }

  approveQuote(q: Quote): void {
    const user = this.authSvc.currentUser()?.name ?? 'Manager';
    this.quoteSvc.approveQuote(q.id, user).subscribe(() => {
      this.allQuotes.update(l => l.map(x => x.id === q.id ? { ...x, status: 'Approved', approvedBy: user } : x));
      this.applyFilter();
      this.snackBar.open('Quote approved!', 'Dismiss', { duration: 3000 });
    });
  }

  rejectQuote(q: Quote): void {
    this.quoteSvc.rejectQuote(q.id).subscribe(() => {
      this.allQuotes.update(l => l.map(x => x.id === q.id ? { ...x, status: 'Rejected' } : x));
      this.applyFilter();
      this.snackBar.open('Quote rejected', 'Dismiss', { duration: 3000 });
    });
  }

  deleteQuote(q: Quote): void {
    if (!confirm(`Delete quote "${q.title}"?`)) return;
    this.quoteSvc.deleteQuote(q.id).subscribe(() => {
      this.allQuotes.update(l => l.filter(x => x.id !== q.id));
      this.applyFilter();
      this.snackBar.open('Quote deleted', 'Dismiss', { duration: 3000 });
    });
  }
}
