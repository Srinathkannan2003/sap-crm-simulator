import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { CustomerService } from '../../../core/services/customer.service';
import { LeadService } from '../../../core/services/lead.service';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { ActivityService } from '../../../core/services/activity.service';
import { Customer, Lead, Opportunity, Activity } from '../../../core/models';

@Component({
  selector: 'app-bp-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTabsModule, MatDividerModule, MatProgressSpinnerModule
  ],
  template: `
<div class="page-container">
  @if (loading()) {
    <div class="loading-overlay" style="position:relative;height:300px"><mat-spinner diameter="40"></mat-spinner></div>
  } @else if (customer()) {
    <div class="page-header">
      <div class="flex items-center gap-2">
        <button mat-icon-button routerLink="/customers"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h1 class="page-title">{{ customer()!.name }}</h1>
          <p class="page-subtitle">{{ customer()!.id }} · {{ customer()!.industry }} · {{ customer()!.accountType }}</p>
        </div>
      </div>
      <div class="page-actions">
        <span class="status-badge" [class]="customer()!.status.toLowerCase()">{{ customer()!.status }}</span>
        <button mat-stroked-button [routerLink]="['../'+customer()!.id+'/edit']">
          <mat-icon>edit</mat-icon> Edit
        </button>
      </div>
    </div>

    <!-- Info cards row -->
    <div class="detail-grid">
      <div class="detail-info-card">
        <div class="info-header">
          <div class="info-avatar">{{ customer()!.name.slice(0,2).toUpperCase() }}</div>
          <div>
            <div class="info-name">{{ customer()!.name }}</div>
            <a [href]="'https://'+customer()!.website" target="_blank" class="info-web">{{ customer()!.website }}</a>
          </div>
        </div>
        <mat-divider style="margin:1rem 0"></mat-divider>
        <div class="info-rows">
          <div class="info-row"><mat-icon>email</mat-icon><span>{{ customer()!.email }}</span></div>
          <div class="info-row"><mat-icon>phone</mat-icon><span>{{ customer()!.phone }}</span></div>
          <div class="info-row"><mat-icon>location_on</mat-icon><span>{{ customer()!.city }}, {{ customer()!.state }}, {{ customer()!.country }}</span></div>
          <div class="info-row"><mat-icon>person</mat-icon><span>{{ customer()!.assignedRep }}</span></div>
        </div>
        <mat-divider style="margin:1rem 0"></mat-divider>
        <div class="info-stats">
          <div class="stat"><span class="stat-val">{{ customer()!.revenue | currency:'USD':'symbol':'1.0-0' }}</span><span class="stat-lbl">Annual Revenue</span></div>
          <div class="stat"><span class="stat-val">{{ customer()!.employees | number }}</span><span class="stat-lbl">Employees</span></div>
        </div>
        @if (customer()!.notes) {
          <mat-divider style="margin:1rem 0"></mat-divider>
          <p class="info-notes">{{ customer()!.notes }}</p>
        }
      </div>

      <!-- Stats sidebar -->
      <div class="detail-stats-col">
        <div class="stat-mini-card blue">
          <mat-icon>track_changes</mat-icon>
          <span class="stat-num">{{ leads().length }}</span>
          <span class="stat-lbl">Leads</span>
        </div>
        <div class="stat-mini-card green">
          <mat-icon>trending_up</mat-icon>
          <span class="stat-num">{{ opportunities().length }}</span>
          <span class="stat-lbl">Opportunities</span>
        </div>
        <div class="stat-mini-card gold">
          <mat-icon>attach_money</mat-icon>
          <span class="stat-num">{{ totalPipeline() | currency:'USD':'symbol':'1.0-0' }}</span>
          <span class="stat-lbl">Pipeline Value</span>
        </div>
        <div class="stat-mini-card purple">
          <mat-icon>event</mat-icon>
          <span class="stat-num">{{ activities().length }}</span>
          <span class="stat-lbl">Activities</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <mat-tab-group animationDuration="200ms" style="margin-top:1.5rem">
      <mat-tab label="Leads ({{ leads().length }})">
        <div class="tab-content">
          @if (!leads().length) {
            <div class="empty-state"><mat-icon>track_changes</mat-icon><p>No leads for this customer</p></div>
          }
          @for (lead of leads(); track lead.id) {
            <div class="list-row">
              <div class="lr-main">
                <a [routerLink]="['/leads', lead.id]" class="lr-title">{{ lead.title }}</a>
                <div class="lr-sub">{{ lead.source }} · {{ lead.createdDate }}</div>
              </div>
              <span class="status-badge" [class]="lead.status.toLowerCase()">{{ lead.status }}</span>
              <span class="lr-value">{{ lead.estimatedValue | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
          }
        </div>
      </mat-tab>

      <mat-tab label="Opportunities ({{ opportunities().length }})">
        <div class="tab-content">
          @if (!opportunities().length) {
            <div class="empty-state"><mat-icon>trending_up</mat-icon><p>No opportunities yet</p></div>
          }
          @for (opp of opportunities(); track opp.id) {
            <div class="list-row">
              <div class="lr-main">
                <a [routerLink]="['/opportunities', opp.id]" class="lr-title">{{ opp.title }}</a>
                <div class="lr-sub">Close: {{ opp.expectedCloseDate }} · {{ opp.probability }}% probability</div>
              </div>
              <span class="status-badge" [class]="opp.stage.toLowerCase().replace(' ','-')">{{ opp.stage }}</span>
              <span class="lr-value">{{ opp.expectedRevenue | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
          }
        </div>
      </mat-tab>

      <mat-tab label="Activities ({{ activities().length }})">
        <div class="tab-content">
          @if (!activities().length) {
            <div class="empty-state"><mat-icon>event</mat-icon><p>No activities recorded</p></div>
          }
          @for (act of activities(); track act.id) {
            <div class="list-row">
              <div class="act-type-icon" [class]="act.type.toLowerCase()">
                <mat-icon>{{ actIcon(act.type) }}</mat-icon>
              </div>
              <div class="lr-main">
                <div class="lr-title">{{ act.subject }}</div>
                <div class="lr-sub">{{ act.dueDate }} · {{ act.assignedTo }}</div>
              </div>
              <span class="status-badge" [class]="act.status.toLowerCase().replace(' ','-')">{{ act.status }}</span>
            </div>
          }
        </div>
      </mat-tab>
    </mat-tab-group>
  }
</div>
  `,
  styles: [`
    .detail-grid { display: grid; grid-template-columns: 1fr 200px; gap: 1.25rem; }
    .detail-info-card { background: var(--bg-white); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem; box-shadow: var(--shadow-xs); }
    .info-header { display: flex; gap: 1rem; align-items: center; }
    .info-avatar { width: 56px; height: 56px; border-radius: 12px; background: var(--sap-blue); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.143rem; font-weight: 700; flex-shrink: 0; }
    .info-name { font-size: 1.143rem; font-weight: 700; }
    .info-web { font-size: .857rem; color: var(--sap-blue); }
    .info-rows { display: flex; flex-direction: column; gap: .625rem; }
    .info-row { display: flex; align-items: center; gap: .625rem; font-size: .875rem; mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--text-secondary); } }
    .info-stats { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
    .stat { display: flex; flex-direction: column; gap: 2px; }
    .stat-val { font-size: 1.143rem; font-weight: 700; }
    .stat-lbl { font-size: .75rem; color: var(--text-secondary); }
    .info-notes { font-size: .857rem; color: var(--text-secondary); line-height: 1.5; margin: 0; }
    .detail-stats-col { display: flex; flex-direction: column; gap: .75rem; }
    .stat-mini-card { background: var(--bg-white); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; box-shadow: var(--shadow-xs);
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
      .stat-num { font-size: 1.143rem; font-weight: 700; }
      .stat-lbl { font-size: .714rem; color: var(--text-secondary); }
      &.blue mat-icon { color: var(--sap-blue); }
      &.green mat-icon { color: var(--sap-green); }
      &.gold mat-icon { color: var(--sap-gold); }
      &.purple mat-icon { color: #6b3fa0; }
    }
    .tab-content { padding: 1.25rem 0; display: flex; flex-direction: column; gap: .625rem; }
    .list-row { display: flex; align-items: center; gap: 1rem; padding: .875rem 1rem; background: #fafbfc; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);
      &:hover { background: #f0f5fc; }
    }
    .lr-main { flex: 1; min-width: 0; }
    .lr-title { font-weight: 600; font-size: .875rem; color: var(--sap-blue); }
    .lr-sub { font-size: .75rem; color: var(--text-secondary); margin-top: 2px; }
    .lr-value { font-weight: 700; font-size: .875rem; white-space: nowrap; }
    .act-type-icon { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &.call { background: #e8f1fb; color: var(--sap-blue); }
      &.meeting { background: var(--sap-green-light); color: var(--sap-green); }
      &.email { background: #fef7e6; color: var(--sap-gold); }
      &.task { background: #f0ebff; color: #6b3fa0; }
    }
    @media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr; } .detail-stats-col { flex-direction: row; flex-wrap: wrap; } .stat-mini-card { flex: 1; min-width: 120px; } }
  `]
})
export class BpDetailComponent implements OnInit {
  loading = signal(true);
  customer = signal<Customer | null>(null);
  leads = signal<Lead[]>([]);
  opportunities = signal<Opportunity[]>([]);
  activities = signal<Activity[]>([]);
  totalPipeline = signal(0);

  constructor(
    private route: ActivatedRoute,
    private customerSvc: CustomerService,
    private leadSvc: LeadService,
    private oppSvc: OpportunityService,
    private actSvc: ActivityService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      customer: this.customerSvc.getCustomer(id),
      leads: this.leadSvc.getLeads({ customerId: id }),
      opportunities: this.oppSvc.getOpportunities({ customerId: id }),
      activities: this.actSvc.getActivities({ customerId: id })
    }).subscribe(({ customer, leads, opportunities, activities }) => {
      this.customer.set(customer);
      this.leads.set(leads);
      this.opportunities.set(opportunities);
      this.activities.set(activities);
      this.totalPipeline.set(opportunities.reduce((s, o) => s + o.expectedRevenue, 0));
      this.loading.set(false);
    });
  }

  actIcon(type: string): string {
    return { Call: 'phone', Meeting: 'people', Email: 'email', Task: 'task_alt' }[type] ?? 'event';
  }
}
