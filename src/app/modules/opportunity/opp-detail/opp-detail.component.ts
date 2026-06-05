import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { ActivityService } from '../../../core/services/activity.service';
import { Opportunity, Activity } from '../../../core/models';

@Component({
  selector: 'app-opp-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, RouterLink,
    MatButtonModule, MatIconModule, MatProgressBarModule,
    MatDividerModule, MatProgressSpinnerModule
  ],
  template: `
<div class="page-container">
  @if (loading()) {
    <div style="position:relative;height:300px"><mat-progress-spinner diameter="40" mode="indeterminate"></mat-progress-spinner></div>
  } @else if (opp()) {
    <div class="page-header">
      <div class="flex items-center gap-2">
        <button mat-icon-button routerLink="/opportunities"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h1 class="page-title">{{ opp()!.title }}</h1>
          <p class="page-subtitle">{{ opp()!.id }} · {{ opp()!.customerName }}</p>
        </div>
      </div>
      <div class="page-actions">
        <span class="status-badge" [class]="opp()!.stage.toLowerCase().replace(' ','-')">{{ opp()!.stage }}</span>
        <button mat-stroked-button [routerLink]="['../'+opp()!.id+'/edit']"><mat-icon>edit</mat-icon> Edit</button>
        <button mat-flat-button color="primary" routerLink="/quotes/new"><mat-icon>request_quote</mat-icon> Create Quote</button>
      </div>
    </div>

    <div class="opp-detail-grid">
      <!-- Left: details -->
      <div>
        <div class="form-section">
          <div class="section-title"><mat-icon>trending_up</mat-icon> Opportunity Overview</div>
          <div class="field-grid">
            <div class="field-item"><span class="field-label">Customer</span><a [routerLink]="['/customers',opp()!.customerId]" class="field-link">{{ opp()!.customerName }}</a></div>
            <div class="field-item"><span class="field-label">Stage</span>
              <span class="status-badge" [class]="opp()!.stage.toLowerCase().replace(' ','-')">{{ opp()!.stage }}</span>
            </div>
            <div class="field-item"><span class="field-label">Expected Revenue</span><span class="field-val big">{{ opp()!.expectedRevenue | currency:'USD':'symbol':'1.0-0' }}</span></div>
            <div class="field-item"><span class="field-label">Weighted Value</span><span class="field-val">{{ weightedValue() | currency:'USD':'symbol':'1.0-0' }}</span></div>
            <div class="field-item"><span class="field-label">Close Date</span><span class="field-val">{{ opp()!.expectedCloseDate }}</span></div>
            <div class="field-item"><span class="field-label">Assigned Rep</span><span class="field-val">{{ opp()!.assignedRep }}</span></div>
            <div class="field-item"><span class="field-label">Competitors</span><span class="field-val">{{ opp()!.competitorInfo }}</span></div>
            <div class="field-item"><span class="field-label">Last Activity</span><span class="field-val">{{ opp()!.lastActivity }}</span></div>
          </div>

          <div class="prob-section">
            <div class="prob-row">
              <span>Win Probability</span>
              <strong>{{ opp()!.probability }}%</strong>
            </div>
            <mat-progress-bar mode="determinate" [value]="opp()!.probability"
              [color]="opp()!.probability>=70?'primary':opp()!.probability>=40?'accent':'warn'"></mat-progress-bar>
          </div>

          @if (opp()!.description) {
            <mat-divider style="margin:1rem 0"></mat-divider>
            <p style="font-size:.875rem;color:var(--text-secondary);line-height:1.6">{{ opp()!.description }}</p>
          }
          @if (opp()!.nextSteps) {
            <div class="next-steps">
              <mat-icon>arrow_forward</mat-icon>
              <div><strong>Next Steps:</strong> {{ opp()!.nextSteps }}</div>
            </div>
          }
        </div>

        @if (opp()!.products?.length) {
          <div class="form-section">
            <div class="section-title"><mat-icon>inventory_2</mat-icon> Products / Solutions</div>
            <div class="chip-list">
              @for (p of opp()!.products; track p) {
                <span class="chip">{{ p }}</span>
              }
            </div>
          </div>
        }
      </div>

      <!-- Right: stage pipeline + activities -->
      <div>
        <div class="form-section">
          <div class="section-title"><mat-icon>timeline</mat-icon> Sales Stage</div>
          <div class="stage-pipeline">
            @for (s of allStages; track s.key) {
              <div class="stage-step" [class.active]="opp()!.stage === s.key" [class.done]="isStageCompleted(s.key)" [style.--stage-color]="s.color">
                <div class="ss-dot"></div>
                <span>{{ s.key }}</span>
              </div>
            }
          </div>
        </div>

        <div class="form-section">
          <div class="section-title"><mat-icon>event</mat-icon> Related Activities</div>
          @if (!activities().length) {
            <div class="empty-state" style="padding:1.5rem"><mat-icon>event_busy</mat-icon><p>No activities</p></div>
          }
          @for (act of activities(); track act.id) {
            <div class="act-row">
              <div class="act-icon-sm" [class]="act.type.toLowerCase()">
                <mat-icon>{{ actIcon(act.type) }}</mat-icon>
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-size:.829rem;font-weight:600">{{ act.subject }}</div>
                <div style="font-size:.75rem;color:var(--text-secondary)">{{ act.dueDate }} · {{ act.assignedTo }}</div>
              </div>
              <span class="status-badge" [class]="act.status.toLowerCase().replace(' ','-')">{{ act.status }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    .opp-detail-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.25rem; }
    .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .field-item { display: flex; flex-direction: column; gap: 3px; }
    .field-label { font-size: .714rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--text-secondary); }
    .field-val { font-size: .875rem; }
    .field-val.big { font-size: 1.25rem; font-weight: 700; }
    .field-link { font-size: .875rem; color: var(--sap-blue); font-weight: 600; }
    .prob-section { margin-top: 1rem; }
    .prob-row { display: flex; justify-content: space-between; margin-bottom: .375rem; font-size: .875rem; }
    .next-steps { display: flex; align-items: flex-start; gap: .5rem; background: #f0f5fc; padding: .75rem 1rem; border-radius: var(--radius-sm); font-size: .875rem; margin-top: 1rem;
      mat-icon { color: var(--sap-blue); font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; margin-top: 2px; }
    }
    .stage-pipeline { display: flex; flex-direction: column; gap: .5rem; }
    .stage-step { display: flex; align-items: center; gap: .625rem; font-size: .857rem; color: var(--text-secondary); opacity: .5;
      &.done, &.active { opacity: 1; color: var(--text-primary); font-weight: 600; }
      .ss-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--border-color); flex-shrink: 0; }
      &.done .ss-dot { background: var(--sap-green); }
      &.active .ss-dot { background: var(--stage-color, var(--sap-blue)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--stage-color, var(--sap-blue)) 20%, transparent); }
    }
    .act-row { display: flex; align-items: center; gap: .75rem; padding: .5rem; border-radius: var(--radius-sm); margin-bottom: .375rem;
      &:hover { background: #fafbfc; }
    }
    .act-icon-sm { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &.call { background: #e8f1fb; color: var(--sap-blue); }
      &.meeting { background: var(--sap-green-light); color: var(--sap-green); }
      &.email { background: #fef7e6; color: var(--sap-gold); }
      &.task { background: #f0ebff; color: #6b3fa0; }
    }
    @media (max-width: 1000px) { .opp-detail-grid { grid-template-columns: 1fr; } }
  `]
})
export class OppDetailComponent implements OnInit {
  loading = signal(true);
  opp = signal<Opportunity | null>(null);
  activities = signal<Activity[]>([]);

  allStages = [
    { key: 'Discovery', color: '#0a6ed1' },
    { key: 'Qualification', color: '#e8a000' },
    { key: 'Proposal', color: '#6b3fa0' },
    { key: 'Negotiation', color: '#e76500' },
    { key: 'Closed Won', color: '#107e3e' },
    { key: 'Closed Lost', color: '#bb0000' },
  ];

  stageOrder = ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'];

  weightedValue() {
    const o = this.opp();
    return o ? o.expectedRevenue * o.probability / 100 : 0;
  }

  constructor(
    private route: ActivatedRoute,
    private oppSvc: OpportunityService,
    private actSvc: ActivityService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      opp: this.oppSvc.getOpportunity(id),
      activities: this.actSvc.getActivities({ opportunityId: id })
    }).subscribe(({ opp, activities }) => {
      this.opp.set(opp);
      this.activities.set(activities);
      this.loading.set(false);
    });
  }

  isStageCompleted(key: string): boolean {
    const current = this.opp()?.stage;
    if (current === 'Closed Won') return this.stageOrder.indexOf(key) < this.stageOrder.indexOf('Closed Won');
    return this.stageOrder.indexOf(key) < this.stageOrder.indexOf(current ?? '');
  }

  actIcon(type: string): string {
    return { Call: 'phone', Meeting: 'people', Email: 'email', Task: 'task_alt' }[type] ?? 'event';
  }
}
