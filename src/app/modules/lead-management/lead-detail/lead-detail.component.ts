import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { LeadService } from '../../../core/services/lead.service';
import { Lead } from '../../../core/models';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, RouterLink,
    MatButtonModule, MatIconModule, MatDividerModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatChipsModule
  ],
  template: `
<div class="page-container">
  @if (loading()) {
    <div style="position:relative;height:300px"><mat-spinner diameter="40"></mat-spinner></div>
  } @else if (lead()) {
    <div class="page-header">
      <div class="flex items-center gap-2">
        <button mat-icon-button routerLink="/leads"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h1 class="page-title">{{ lead()!.title }}</h1>
          <p class="page-subtitle">{{ lead()!.id }} · {{ lead()!.customerName }}</p>
        </div>
      </div>
      <div class="page-actions">
        <span class="status-badge" [class]="lead()!.status.toLowerCase()">{{ lead()!.status }}</span>
        <span class="status-badge" [class]="lead()!.priority.toLowerCase()">{{ lead()!.priority }}</span>
        @if (lead()!.status === 'Qualified') {
          <button mat-flat-button color="primary" (click)="convertLead()">
            <mat-icon>autorenew</mat-icon> Convert to Opportunity
          </button>
        }
        <button mat-stroked-button [routerLink]="['../'+lead()!.id+'/edit']">
          <mat-icon>edit</mat-icon> Edit
        </button>
      </div>
    </div>

    <div class="detail-layout">
      <!-- Main info -->
      <div class="detail-main">
        <div class="form-section">
          <div class="section-title"><mat-icon>track_changes</mat-icon> Lead Details</div>
          <div class="field-grid">
            <div class="field-item"><span class="field-label">Customer</span><span class="field-val">{{ lead()!.customerName }}</span></div>
            <div class="field-item"><span class="field-label">Industry</span><span class="field-val">{{ lead()!.industry }}</span></div>
            <div class="field-item"><span class="field-label">Source</span><span class="field-val">{{ lead()!.source }}</span></div>
            <div class="field-item"><span class="field-label">Campaign</span><span class="field-val">{{ lead()!.campaign }}</span></div>
            <div class="field-item"><span class="field-label">Estimated Value</span><span class="field-val font-bold">{{ lead()!.estimatedValue | currency:'USD':'symbol':'1.0-0' }}</span></div>
            <div class="field-item"><span class="field-label">Assigned To</span><span class="field-val">{{ lead()!.assignedRep }}</span></div>
            <div class="field-item"><span class="field-label">Created</span><span class="field-val">{{ lead()!.createdDate }}</span></div>
            <div class="field-item"><span class="field-label">Last Activity</span><span class="field-val">{{ lead()!.lastActivity }}</span></div>
          </div>
          @if (lead()!.description) {
            <mat-divider style="margin:1rem 0"></mat-divider>
            <p style="color:var(--text-secondary);font-size:.875rem;line-height:1.6">{{ lead()!.description }}</p>
          }
        </div>

        <div class="form-section">
          <div class="section-title"><mat-icon>person</mat-icon> Contact Person</div>
          <div class="field-grid">
            <div class="field-item"><span class="field-label">Name</span><span class="field-val">{{ lead()!.contactName }}</span></div>
            <div class="field-item"><span class="field-label">Email</span><a [href]="'mailto:'+lead()!.contactEmail" class="field-val link">{{ lead()!.contactEmail }}</a></div>
            <div class="field-item"><span class="field-label">Phone</span><span class="field-val">{{ lead()!.contactPhone }}</span></div>
          </div>
        </div>
      </div>

      <!-- Status timeline -->
      <div class="detail-sidebar">
        <div class="form-section">
          <div class="section-title"><mat-icon>timeline</mat-icon> Status Progress</div>
          <div class="status-timeline">
            @for (s of statuses; track s.key) {
              <div class="timeline-step" [class.done]="isStatusReached(s.key)" [class.current]="lead()!.status === s.key">
                <div class="step-dot"><mat-icon>{{ isStatusReached(s.key) ? 'check' : 'radio_button_unchecked' }}</mat-icon></div>
                <div class="step-info">
                  <div class="step-label">{{ s.label }}</div>
                  <div class="step-sub">{{ s.desc }}</div>
                </div>
              </div>
            }
          </div>
        </div>

        @if (lead()!.convertedOpportunityId) {
          <div class="form-section">
            <div class="section-title"><mat-icon>trending_up</mat-icon> Converted</div>
            <a [routerLink]="['/opportunities', lead()!.convertedOpportunityId]" class="converted-link">
              <mat-icon>open_in_new</mat-icon> View Opportunity {{ lead()!.convertedOpportunityId }}
            </a>
          </div>
        }
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    .detail-layout { display: grid; grid-template-columns: 1fr 280px; gap: 1.25rem; }
    .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .875rem; }
    .field-item { display: flex; flex-direction: column; gap: 3px; }
    .field-label { font-size: .714rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--text-secondary); }
    .field-val { font-size: .875rem; color: var(--text-primary); }
    .field-val.font-bold { font-weight: 700; }
    .field-val.link { color: var(--sap-blue); }
    .status-timeline { display: flex; flex-direction: column; gap: .75rem; }
    .timeline-step { display: flex; gap: .75rem; align-items: flex-start; opacity: .4; transition: opacity var(--transition);
      &.done, &.current { opacity: 1; }
      &.current .step-dot mat-icon { color: var(--sap-blue); }
      &.done .step-dot mat-icon { color: var(--sap-green); }
    }
    .step-dot mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .step-label { font-size: .857rem; font-weight: 600; }
    .step-sub { font-size: .75rem; color: var(--text-secondary); }
    .converted-link { display: flex; align-items: center; gap: .5rem; color: var(--sap-blue); font-size: .875rem; font-weight: 600; }
    @media (max-width: 900px) { .detail-layout { grid-template-columns: 1fr; } }
  `]
})
export class LeadDetailComponent implements OnInit {
  loading = signal(true);
  lead = signal<Lead | null>(null);

  statuses = [
    { key: 'New', label: 'New Lead', desc: 'Lead captured and assigned' },
    { key: 'Qualified', label: 'Qualified', desc: 'Lead vetted and approved' },
    { key: 'Converted', label: 'Converted', desc: 'Opportunity created' },
    { key: 'Lost', label: 'Lost', desc: 'Lead not pursued' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leadSvc: LeadService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.leadSvc.getLead(id).subscribe(l => { this.lead.set(l); this.loading.set(false); });
  }

  isStatusReached(key: string): boolean {
    const order = ['New', 'Qualified', 'Converted'];
    const current = this.lead()?.status;
    return order.indexOf(key) <= order.indexOf(current ?? '');
  }

  convertLead(): void {
    const id = this.lead()!.id;
    const oppId = `OPP-${Math.floor(Math.random() * 900) + 100}`;
    this.leadSvc.convertLead(id, oppId).subscribe(() => {
      this.lead.update(l => l ? { ...l, status: 'Converted', convertedOpportunityId: oppId } : l);
      this.snackBar.open('Lead converted to opportunity', 'View', { duration: 4000 })
        .onAction().subscribe(() => this.router.navigate(['/opportunities/new']));
    });
  }
}
