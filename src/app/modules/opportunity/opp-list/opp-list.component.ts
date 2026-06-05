import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Opportunity, OpportunityStage } from '../../../core/models';

@Component({
  selector: 'app-opp-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatTabsModule,
    MatProgressBarModule, MatTooltipModule, MatSnackBarModule
  ],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">Opportunity Management</h1>
      <p class="page-subtitle">{{ allOpps().length }} opportunities · Pipeline: {{ totalPipeline() | currency:'USD':'symbol':'1.0-0' }}</p>
    </div>
    <div class="page-actions">
      <button mat-stroked-button (click)="viewMode.set(viewMode()==='list'?'pipeline':'list')">
        <mat-icon>{{ viewMode()==='list' ? 'view_kanban' : 'list' }}</mat-icon>
        {{ viewMode()==='list' ? 'Pipeline View' : 'List View' }}
      </button>
      <button mat-flat-button color="primary" routerLink="new">
        <mat-icon>add</mat-icon> New Opportunity
      </button>
    </div>
  </div>

  <!-- Filters -->
  <div class="filter-bar">
    <mat-form-field appearance="outline" class="search-field">
      <mat-icon matPrefix>search</mat-icon>
      <input matInput [(ngModel)]="search" (ngModelChange)="applyFilter()" placeholder="Search opportunities…">
    </mat-form-field>
    <mat-form-field appearance="outline" style="width:150px">
      <mat-label>Stage</mat-label>
      <mat-select [(ngModel)]="filterStage" (ngModelChange)="applyFilter()">
        <mat-option value="">All Stages</mat-option>
        @for (s of stages; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
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

  <!-- List View -->
  @if (viewMode() === 'list') {
    <div class="opp-list">
      @if (!filtered().length) {
        <div class="empty-state"><mat-icon>trending_up</mat-icon><p>No opportunities found</p></div>
      }
      @for (opp of filtered(); track opp.id) {
        <div class="opp-card">
          <div class="opp-card-header">
            <div class="opp-card-title-area">
              <a [routerLink]="[opp.id]" class="opp-title">{{ opp.title }}</a>
              <div class="opp-sub">{{ opp.customerName }} · Assigned: {{ opp.assignedRep }}</div>
            </div>
            <div class="opp-card-badges">
              <span class="status-badge" [class]="opp.stage.toLowerCase().replace(' ','-')">{{ opp.stage }}</span>
            </div>
            <div class="opp-card-actions">
              <button mat-icon-button [routerLink]="[opp.id,'edit']" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button (click)="deleteOpp(opp)" color="warn" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
            </div>
          </div>
          <div class="opp-card-footer">
            <div class="opp-metric">
              <span class="metric-lbl">Revenue</span>
              <span class="metric-val">{{ opp.expectedRevenue | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
            <div class="opp-metric">
              <span class="metric-lbl">Probability</span>
              <span class="metric-val">{{ opp.probability }}%</span>
            </div>
            <div class="opp-metric">
              <span class="metric-lbl">Close Date</span>
              <span class="metric-val">{{ opp.expectedCloseDate }}</span>
            </div>
            <div class="opp-prob-bar">
              <mat-progress-bar mode="determinate" [value]="opp.probability"
                [color]="opp.probability>=70?'primary':opp.probability>=40?'accent':'warn'"></mat-progress-bar>
            </div>
          </div>
        </div>
      }
    </div>
  }

  <!-- Pipeline View -->
  @if (viewMode() === 'pipeline') {
    <div class="pipeline-board">
      @for (stage of pipelineStages; track stage.key) {
        <div class="pipeline-col">
          <div class="pipeline-col-header" [style.border-top-color]="stage.color">
            <span class="col-label">{{ stage.key }}</span>
            <span class="col-count">{{ getByStage(stage.key).length }}</span>
            <span class="col-value">{{ stageTotal(stage.key) | currency:'USD':'symbol':'1.0-0' }}</span>
          </div>
          <div class="pipeline-cards">
            @for (opp of getByStage(stage.key); track opp.id) {
              <div class="pipeline-card" [routerLink]="[opp.id]">
                <div class="pc-title">{{ opp.title }}</div>
                <div class="pc-customer">{{ opp.customerName }}</div>
                <div class="pc-footer">
                  <span class="pc-value">{{ opp.expectedRevenue | currency:'USD':'symbol':'1.0-0' }}</span>
                  <span class="pc-prob">{{ opp.probability }}%</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  }
</div>
  `,
  styles: [`
    .filter-bar { display: flex; gap: .875rem; margin-bottom: 1.25rem; flex-wrap: wrap; align-items: center; }
    .opp-list { display: flex; flex-direction: column; gap: .75rem; }
    .opp-card { background: var(--bg-white); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem 1.25rem; box-shadow: var(--shadow-xs); transition: box-shadow var(--transition);
      &:hover { box-shadow: var(--shadow-sm); }
    }
    .opp-card-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: .75rem; }
    .opp-card-title-area { flex: 1; min-width: 0; }
    .opp-title { font-size: .929rem; font-weight: 700; color: var(--sap-blue); display: block; }
    .opp-sub { font-size: .786rem; color: var(--text-secondary); margin-top: 3px; }
    .opp-card-badges { display: flex; gap: .5rem; align-items: center; }
    .opp-card-actions { display: flex; opacity: 0; transition: opacity var(--transition); }
    .opp-card:hover .opp-card-actions { opacity: 1; }
    .opp-card-footer { display: grid; grid-template-columns: 1fr 1fr 1fr 2fr; align-items: center; gap: 1rem; }
    .opp-metric { display: flex; flex-direction: column; gap: 2px; }
    .metric-lbl { font-size: .643rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--text-secondary); }
    .metric-val { font-size: .875rem; font-weight: 700; }
    .pipeline-board { display: grid; grid-template-columns: repeat(6, minmax(180px, 1fr)); gap: .875rem; overflow-x: auto; padding-bottom: 1rem; }
    .pipeline-col { background: #f7f8f9; border-radius: var(--radius-md); padding: .875rem; border: 1px solid var(--border-subtle); }
    .pipeline-col-header { border-top: 3px solid var(--sap-blue); padding-top: .75rem; margin-bottom: .875rem; }
    .col-label { display: block; font-size: .786rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
    .col-count { font-size: .786rem; color: var(--text-secondary); margin-right: .5rem; }
    .col-value { font-size: .786rem; font-weight: 600; color: var(--sap-green); display: block; }
    .pipeline-cards { display: flex; flex-direction: column; gap: .625rem; }
    .pipeline-card { background: white; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: .75rem; cursor: pointer; transition: box-shadow var(--transition);
      &:hover { box-shadow: var(--shadow-sm); }
    }
    .pc-title { font-size: .786rem; font-weight: 600; line-height: 1.3; margin-bottom: 4px; }
    .pc-customer { font-size: .714rem; color: var(--text-secondary); margin-bottom: .5rem; }
    .pc-footer { display: flex; justify-content: space-between; align-items: center; }
    .pc-value { font-size: .75rem; font-weight: 700; }
    .pc-prob { font-size: .714rem; background: #e8f1fb; color: var(--sap-blue); padding: 1px 6px; border-radius: 10px; font-weight: 600; }
  `]
})
export class OppListComponent implements OnInit {
  allOpps = signal<Opportunity[]>([]);
  filtered = signal<Opportunity[]>([]);
  viewMode = signal<'list' | 'pipeline'>('list');

  search = '';
  filterStage = '';
  filterRep = '';

  stages: OpportunityStage[] = ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  pipelineStages = [
    { key: 'Discovery', color: '#0a6ed1' },
    { key: 'Qualification', color: '#e8a000' },
    { key: 'Proposal', color: '#6b3fa0' },
    { key: 'Negotiation', color: '#e76500' },
    { key: 'Closed Won', color: '#107e3e' },
    { key: 'Closed Lost', color: '#bb0000' },
  ];

  totalPipeline = computed(() =>
    this.filtered()
      .filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage))
      .reduce((s, o) => s + o.expectedRevenue * o.probability / 100, 0)
  );

  constructor(private oppSvc: OpportunityService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.oppSvc.getOpportunities().subscribe(d => { this.allOpps.set(d); this.filtered.set(d); });
  }

  applyFilter(): void {
    let d = [...this.allOpps()];
    if (this.search) {
      const q = this.search.toLowerCase();
      d = d.filter(o => o.title.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
    }
    if (this.filterStage) d = d.filter(o => o.stage === this.filterStage);
    if (this.filterRep) d = d.filter(o => o.assignedRep === this.filterRep);
    this.filtered.set(d);
  }

  getByStage(stage: string): Opportunity[] {
    return this.allOpps().filter(o => o.stage === stage);
  }

  stageTotal(stage: string): number {
    return this.getByStage(stage).reduce((s, o) => s + o.expectedRevenue, 0);
  }

  deleteOpp(opp: Opportunity): void {
    if (!confirm(`Delete "${opp.title}"?`)) return;
    this.oppSvc.deleteOpportunity(opp.id).subscribe(() => {
      this.allOpps.update(l => l.filter(x => x.id !== opp.id));
      this.applyFilter();
      this.snackBar.open('Opportunity deleted', 'Dismiss', { duration: 3000 });
    });
  }
}
