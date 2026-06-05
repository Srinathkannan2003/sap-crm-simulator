import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QuoteService } from '../../../core/services/quote.service';
import { AuthService } from '../../../core/services/auth.service';
import { Quote } from '../../../core/models';

@Component({
  selector: 'app-quote-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, RouterLink,
    MatButtonModule, MatIconModule, MatDividerModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
<div class="page-container">
  @if (loading()) {
    <div style="position:relative;height:300px"><mat-spinner diameter="40" mode="indeterminate"></mat-spinner></div>
  } @else if (quote()) {
    <div class="page-header">
      <div class="flex items-center gap-2">
        <button mat-icon-button routerLink="/quotes"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h1 class="page-title">{{ quote()!.title }}</h1>
          <p class="page-subtitle">{{ quote()!.id }} · {{ quote()!.customerName }}</p>
        </div>
      </div>
      <div class="page-actions">
        <span class="status-badge" [class]="quote()!.status.toLowerCase()">{{ quote()!.status }}</span>
        @if (quote()!.status === 'Draft') {
          <button mat-stroked-button [routerLink]="['../'+quote()!.id+'/edit']"><mat-icon>edit</mat-icon> Edit</button>
          <button mat-flat-button color="primary" (click)="submit()"><mat-icon>send</mat-icon> Submit</button>
        }
        @if (quote()!.status === 'Submitted' && isManager()) {
          <button mat-flat-button style="background:var(--sap-green);color:white" (click)="approve()"><mat-icon>check_circle</mat-icon> Approve</button>
          <button mat-stroked-button color="warn" (click)="reject()"><mat-icon>cancel</mat-icon> Reject</button>
        }
        <button mat-stroked-button (click)="print()"><mat-icon>print</mat-icon> Print</button>
      </div>
    </div>

    <!-- Quote document -->
    <div class="quote-doc" id="quote-print">
      <!-- Doc header -->
      <div class="doc-header">
        <div class="doc-brand">
          <div class="doc-logo">SAP</div>
          <div>
            <div class="doc-company">SAP CRM Sales Simulator</div>
            <div class="doc-tagline">Enterprise Solutions Division</div>
          </div>
        </div>
        <div class="doc-meta">
          <h2 class="doc-title">SALES QUOTE</h2>
          <div class="doc-meta-grid">
            <span class="dm-label">Quote No.</span><span class="dm-val">{{ quote()!.id }}</span>
            <span class="dm-label">Date</span><span class="dm-val">{{ quote()!.createdDate }}</span>
            <span class="dm-label">Valid Until</span><span class="dm-val">{{ quote()!.validUntil }}</span>
            <span class="dm-label">Status</span>
            <span class="dm-val">
              <span class="status-badge" [class]="quote()!.status.toLowerCase()">{{ quote()!.status }}</span>
            </span>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Bill to / from -->
      <div class="doc-parties">
        <div class="party">
          <div class="party-label">Bill To</div>
          <div class="party-name">{{ quote()!.customerName }}</div>
        </div>
        <div class="party">
          <div class="party-label">Sales Representative</div>
          <div class="party-name">{{ quote()!.assignedRep }}</div>
        </div>
        @if (quote()!.approvedBy) {
          <div class="party">
            <div class="party-label">Approved By</div>
            <div class="party-name">{{ quote()!.approvedBy }}</div>
          </div>
        }
      </div>

      <!-- Line items table -->
      <table class="doc-table">
        <thead>
          <tr>
            <th style="width:40px">#</th>
            <th>Product / Description</th>
            <th style="width:60px;text-align:center">Qty</th>
            <th style="width:130px;text-align:right">Unit Price</th>
            <th style="width:70px;text-align:center">Disc %</th>
            <th style="width:130px;text-align:right">Line Total</th>
          </tr>
        </thead>
        <tbody>
          @for (item of quote()!.lineItems; track $index; let i = $index) {
            <tr>
              <td class="line-num">{{ i + 1 }}</td>
              <td class="line-product">{{ item.product }}</td>
              <td class="text-center">{{ item.quantity }}</td>
              <td class="text-right">{{ item.unitPrice | currency:'USD':'symbol':'1.0-0' }}</td>
              <td class="text-center">{{ item.discount }}%</td>
              <td class="text-right line-total">{{ item.total | currency:'USD':'symbol':'1.0-0' }}</td>
            </tr>
          }
        </tbody>
      </table>

      <!-- Totals -->
      <div class="doc-totals">
        <div class="dt-row"><span>Subtotal</span><span>{{ quote()!.subtotal | currency:'USD':'symbol':'1.2-2' }}</span></div>
        <div class="dt-row discount"><span>Discount</span><span>- {{ quote()!.discount | currency:'USD':'symbol':'1.2-2' }}</span></div>
        <div class="dt-row"><span>Tax</span><span>{{ quote()!.tax | currency:'USD':'symbol':'1.2-2' }}</span></div>
        <mat-divider></mat-divider>
        <div class="dt-row grand"><span>Total ({{ quote()!.currency }})</span><span>{{ quote()!.total | currency:'USD':'symbol':'1.2-2' }}</span></div>
      </div>

      <!-- Notes -->
      @if (quote()!.notes) {
        <div class="doc-notes">
          <div class="notes-label">Notes & Terms</div>
          <p>{{ quote()!.notes }}</p>
        </div>
      }

      <!-- Approval stamp -->
      @if (quote()!.status === 'Approved') {
        <div class="approval-stamp">
          <mat-icon>verified</mat-icon>
          <div>
            <strong>APPROVED</strong>
            <div>by {{ quote()!.approvedBy }}</div>
          </div>
        </div>
      }
      @if (quote()!.status === 'Rejected') {
        <div class="approval-stamp rejected">
          <mat-icon>cancel</mat-icon>
          <div><strong>REJECTED</strong></div>
        </div>
      }
    </div>
  }
</div>
  `,
  styles: [`
    .quote-doc {
      background: white;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 2.5rem;
      box-shadow: var(--shadow-sm);
      max-width: 900px;
    }

    .doc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .doc-brand { display: flex; align-items: center; gap: 1rem; }
    .doc-logo { width: 48px; height: 48px; background: var(--sap-blue); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: 800; }
    .doc-company { font-size: 1.143rem; font-weight: 700; }
    .doc-tagline { font-size: .786rem; color: var(--text-secondary); }

    .doc-title { font-size: 1.429rem; font-weight: 700; text-align: right; margin: 0 0 .75rem; letter-spacing: .05em; color: var(--sap-shell); }
    .doc-meta-grid { display: grid; grid-template-columns: auto 1fr; gap: .25rem .875rem; text-align: right; }
    .dm-label { font-size: .786rem; color: var(--text-secondary); font-weight: 600; }
    .dm-val { font-size: .857rem; font-weight: 500; }

    .doc-parties { display: flex; gap: 3rem; margin: 1.5rem 0; }
    .party-label { font-size: .714rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--text-secondary); margin-bottom: .25rem; }
    .party-name { font-size: .929rem; font-weight: 600; }

    .doc-table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: .875rem; }
    .doc-table th { padding: .625rem .875rem; background: var(--sap-shell); color: white; font-size: .714rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
    .doc-table td { padding: .75rem .875rem; border-bottom: 1px solid var(--border-subtle); }
    .doc-table tbody tr:hover td { background: #f8fbff; }
    .line-num { color: var(--text-secondary); font-size: .786rem; }
    .line-product { font-weight: 500; }
    .line-total { font-weight: 700; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }

    .doc-totals { margin-left: auto; width: 320px; display: flex; flex-direction: column; gap: .5rem; margin-bottom: 1.5rem; }
    .dt-row { display: flex; justify-content: space-between; font-size: .929rem; color: var(--text-secondary); }
    .dt-row.discount span:last-child { color: var(--sap-green); }
    .dt-row.grand { font-size: 1.143rem; font-weight: 700; color: var(--text-primary); margin-top: .25rem; }

    .doc-notes { background: #f7f8f9; border-radius: var(--radius-sm); padding: 1rem 1.25rem; font-size: .857rem; }
    .notes-label { font-size: .714rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--text-secondary); margin-bottom: .375rem; }
    .doc-notes p { margin: 0; color: var(--text-secondary); line-height: 1.5; }

    .approval-stamp { display: flex; align-items: center; gap: .75rem; padding: 1rem 1.5rem; border: 2px solid var(--sap-green); border-radius: var(--radius-md); background: var(--sap-green-light); color: var(--sap-green); margin-top: 1.5rem; width: fit-content;
      mat-icon { font-size: 32px; width: 32px; height: 32px; }
      strong { font-size: 1rem; letter-spacing: .05em; }
      div > div { font-size: .786rem; }
      &.rejected { border-color: var(--sap-red); background: var(--sap-red-light); color: var(--sap-red); }
    }

    @media print {
      .page-header, .mat-sidenav, .shell-header { display: none !important; }
      .quote-doc { box-shadow: none; border: none; padding: 0; }
    }
  `]
})
export class QuoteDetailComponent implements OnInit {
  loading = signal(true);
  quote = signal<Quote | null>(null);
  isManager = this.authSvc.isManager;

  constructor(
    private route: ActivatedRoute,
    private quoteSvc: QuoteService,
    private authSvc: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.quoteSvc.getQuote(id).subscribe(q => { this.quote.set(q); this.loading.set(false); });
  }

  submit(): void {
    this.quoteSvc.submitQuote(this.quote()!.id).subscribe(() => {
      this.quote.update(q => q ? { ...q, status: 'Submitted' } : q);
      this.snackBar.open('Quote submitted for approval', 'Dismiss', { duration: 3000 });
    });
  }

  approve(): void {
    const by = this.authSvc.currentUser()?.name ?? 'Manager';
    this.quoteSvc.approveQuote(this.quote()!.id, by).subscribe(() => {
      this.quote.update(q => q ? { ...q, status: 'Approved', approvedBy: by } : q);
      this.snackBar.open('Quote approved!', 'Dismiss', { duration: 3000 });
    });
  }

  reject(): void {
    this.quoteSvc.rejectQuote(this.quote()!.id).subscribe(() => {
      this.quote.update(q => q ? { ...q, status: 'Rejected' } : q);
      this.snackBar.open('Quote rejected', 'Dismiss', { duration: 3000 });
    });
  }

  print(): void { window.print(); }
}
