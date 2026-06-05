import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CustomerService } from '../../core/services/customer.service';
import { LeadService } from '../../core/services/lead.service';
import { OpportunityService } from '../../core/services/opportunity.service';
import { QuoteService } from '../../core/services/quote.service';
import { ActivityService } from '../../core/services/activity.service';
import { Customer, Lead, Opportunity, Quote, Activity } from '../../core/models';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import {
  Chart,
  ArcElement, DoughnutController,
  BarElement, BarController,
  LineElement, LineController, PointElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler
} from 'chart.js';

Chart.register(
  ArcElement, DoughnutController,
  BarElement, BarController,
  LineElement, LineController, PointElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe,
    MatCardModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, RouterLink, BaseChartDirective
  ],
  template: `
<div class="page-container">
  <!-- Header -->
  <div class="page-header">
    <div>
      <h1 class="page-title">Sales Dashboard</h1>
      <p class="page-subtitle">Overview of your CRM sales pipeline and KPIs</p>
    </div>
    <div class="page-actions">
      <button mat-stroked-button routerLink="/reports">
        <mat-icon>bar_chart</mat-icon> View Reports
      </button>
    </div>
  </div>

  <!-- KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi-card blue">
      <div class="kpi-icon"><mat-icon>people</mat-icon></div>
      <div class="kpi-content">
        <div class="kpi-value">{{ customers().length }}</div>
        <div class="kpi-label">Total Customers</div>
        <div class="kpi-trend positive">↑ Active accounts</div>
      </div>
    </div>
    <div class="kpi-card orange">
      <div class="kpi-icon"><mat-icon>track_changes</mat-icon></div>
      <div class="kpi-content">
        <div class="kpi-value">{{ openLeads() }}</div>
        <div class="kpi-label">Open Leads</div>
        <div class="kpi-trend positive">↑ {{ qualifiedLeads() }} qualified</div>
      </div>
    </div>
    <div class="kpi-card green">
      <div class="kpi-icon"><mat-icon>check_circle</mat-icon></div>
      <div class="kpi-content">
        <div class="kpi-value">{{ convertedLeads() }}</div>
        <div class="kpi-label">Converted Leads</div>
        <div class="kpi-trend positive">{{ conversionRate() }}% rate</div>
      </div>
    </div>
    <div class="kpi-card purple">
      <div class="kpi-icon"><mat-icon>trending_up</mat-icon></div>
      <div class="kpi-content">
        <div class="kpi-value">{{ openOpportunities() }}</div>
        <div class="kpi-label">Open Opportunities</div>
        <div class="kpi-trend positive">↑ {{ wonOpps() }} won</div>
      </div>
    </div>
    <div class="kpi-card gold">
      <div class="kpi-icon"><mat-icon>attach_money</mat-icon></div>
      <div class="kpi-content">
        <div class="kpi-value">{{ revenuePipeline() | currency:'USD':'symbol':'1.0-0' }}</div>
        <div class="kpi-label">Revenue Pipeline</div>
        <div class="kpi-trend positive">Weighted forecast</div>
      </div>
    </div>
    <div class="kpi-card teal">
      <div class="kpi-icon"><mat-icon>request_quote</mat-icon></div>
      <div class="kpi-content">
        <div class="kpi-value">{{ activeQuotes() }}</div>
        <div class="kpi-label">Active Quotes</div>
        <div class="kpi-trend positive">{{ approvedQuotes() }} approved</div>
      </div>
    </div>
  </div>

  <!-- Charts Row -->
  <div class="charts-grid">
    <!-- Lead Status Doughnut -->
    <div class="chart-card">
      <div class="chart-header">
        <mat-icon>donut_large</mat-icon>
        <h3>Lead Status Distribution</h3>
      </div>
      <div class="chart-body doughnut-wrap">
        @if (leadChartData().datasets[0].data.length) {
          <canvas baseChart
            [data]="leadChartData()"
            [options]="doughnutOptions"
            type="doughnut">
          </canvas>
        }
        <div class="chart-legend">
          @for (item of leadLegend(); track item.label) {
            <div class="legend-item">
              <span class="legend-dot" [style.background]="item.color"></span>
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-value">{{ item.value }}</span>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Opportunity Pipeline Bar -->
    <div class="chart-card wide">
      <div class="chart-header">
        <mat-icon>bar_chart</mat-icon>
        <h3>Opportunity Pipeline by Stage</h3>
      </div>
      <div class="chart-body">
        @if (pipelineChartData().datasets[0].data.length) {
          <canvas baseChart
            [data]="pipelineChartData()"
            [options]="barOptions"
            type="bar">
          </canvas>
        }
      </div>
    </div>

    <!-- Revenue Forecast Line -->
    <div class="chart-card wide">
      <div class="chart-header">
        <mat-icon>show_chart</mat-icon>
        <h3>Revenue Forecast</h3>
      </div>
      <div class="chart-body">
        @if (forecastChartData().datasets[0].data.length) {
          <canvas baseChart
            [data]="forecastChartData()"
            [options]="lineOptions"
            type="line">
          </canvas>
        }
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="chart-card">
      <div class="chart-header">
        <mat-icon>event</mat-icon>
        <h3>Upcoming Activities</h3>
        <a routerLink="/activities" class="chart-link">View All</a>
      </div>
      <div class="activity-list">
        @for (act of recentActivities(); track act.id) {
          <div class="activity-item">
            <div class="act-icon" [class]="act.type.toLowerCase()">
              <mat-icon>{{ activityIcon(act.type) }}</mat-icon>
            </div>
            <div class="act-info">
              <div class="act-subject">{{ act.subject }}</div>
              <div class="act-meta">{{ act.customerName }} · {{ act.dueDate }}</div>
            </div>
            <span class="status-badge" [class]="act.status.toLowerCase().replace(' ','-')">
              {{ act.status }}
            </span>
          </div>
        }
      </div>
    </div>
  </div>

  <!-- Recent Opportunities -->
  <div class="form-section" style="margin-top:1.5rem">
    <div class="section-title"><mat-icon>trending_up</mat-icon> Top Opportunities</div>
    <div class="opp-table">
      @for (opp of topOpportunities(); track opp.id) {
        <div class="opp-row">
          <div class="opp-info">
            <div class="opp-name">{{ opp.title }}</div>
            <div class="opp-customer">{{ opp.customerName }}</div>
          </div>
          <div class="opp-stage">
            <span class="status-badge" [class]="opp.stage.toLowerCase().replace(' ','-')">{{ opp.stage }}</span>
          </div>
          <div class="opp-prob">
            <div class="prob-label">{{ opp.probability }}%</div>
            <mat-progress-bar mode="determinate" [value]="opp.probability" [color]="probColor(opp.probability)"></mat-progress-bar>
          </div>
          <div class="opp-revenue">{{ opp.expectedRevenue | currency:'USD':'symbol':'1.0-0' }}</div>
          <div class="opp-date">{{ opp.expectedCloseDate }}</div>
        </div>
      }
    </div>
  </div>
</div>
  `,
  styles: [`
    .charts-grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      grid-template-rows: auto auto;
      gap: 1.25rem;
    }

    .chart-card {
      background: var(--bg-white);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      box-shadow: var(--shadow-xs);

      &.wide { grid-column: 2; }
    }

    .chart-header {
      display: flex;
      align-items: center;
      gap: .5rem;
      margin-bottom: 1rem;
      mat-icon { color: var(--sap-blue); font-size: 20px; }
      h3 { margin: 0; font-size: .929rem; font-weight: 600; flex: 1; }
    }

    .chart-link {
      font-size: .786rem;
      color: var(--sap-blue);
      font-weight: 500;
    }

    .chart-body { position: relative; max-height: 260px; }
    .doughnut-wrap { display: flex; gap: 1rem; align-items: center; }
    .doughnut-wrap canvas { max-width: 160px; max-height: 160px; }

    .chart-legend { flex: 1; display: flex; flex-direction: column; gap: .5rem; }
    .legend-item { display: flex; align-items: center; gap: .5rem; font-size: .8rem; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .legend-label { flex: 1; color: var(--text-secondary); }
    .legend-value { font-weight: 700; }

    .activity-list { display: flex; flex-direction: column; gap: .625rem; }
    .activity-item { display: flex; align-items: center; gap: .75rem; padding: .5rem; border-radius: var(--radius-sm); background: #fafbfc; }
    .act-icon { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &.call { background: #e8f1fb; color: var(--sap-blue); }
      &.meeting { background: var(--sap-green-light); color: var(--sap-green); }
      &.email { background: #fef7e6; color: var(--sap-gold); }
      &.task { background: #f0ebff; color: #6b3fa0; }
    }
    .act-info { flex: 1; min-width: 0; }
    .act-subject { font-size: .829rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .act-meta { font-size: .75rem; color: var(--text-secondary); }

    .opp-table { display: flex; flex-direction: column; gap: .5rem; }
    .opp-row { display: grid; grid-template-columns: 1fr 140px 180px 130px 110px; align-items: center; gap: 1rem; padding: .75rem 1rem; border-radius: var(--radius-sm); background: #fafbfc; border: 1px solid var(--border-subtle);
      &:hover { background: #f0f5fc; }
    }
    .opp-name { font-size: .857rem; font-weight: 600; }
    .opp-customer { font-size: .75rem; color: var(--text-secondary); }
    .opp-revenue { font-weight: 700; font-size: .875rem; text-align: right; font-variant-numeric: tabular-nums; }
    .opp-date { font-size: .786rem; color: var(--text-secondary); text-align: right; }
    .prob-label { font-size: .75rem; font-weight: 600; margin-bottom: 4px; }

    @media (max-width: 1100px) {
      .charts-grid { grid-template-columns: 1fr; }
      .chart-card.wide { grid-column: 1; }
      .opp-row { grid-template-columns: 1fr 120px 120px; }
      .opp-prob, .opp-date { display: none; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  customers = signal<Customer[]>([]);
  leads = signal<Lead[]>([]);
  opportunities = signal<Opportunity[]>([]);
  quotes = signal<Quote[]>([]);
  activities = signal<Activity[]>([]);

  openLeads = signal(0);
  qualifiedLeads = signal(0);
  convertedLeads = signal(0);
  conversionRate = signal(0);
  openOpportunities = signal(0);
  wonOpps = signal(0);
  revenuePipeline = signal(0);
  activeQuotes = signal(0);
  approvedQuotes = signal(0);

  topOpportunities = signal<Opportunity[]>([]);
  recentActivities = signal<Activity[]>([]);

  leadChartData = signal<ChartData>({ labels: [], datasets: [{ data: [] }] });
  pipelineChartData = signal<ChartData>({ labels: [], datasets: [{ data: [] }] });
  forecastChartData = signal<ChartData>({ labels: [], datasets: [{ data: [] }] });
  leadLegend = signal<{ label: string; color: string; value: number }[]>([]);

  readonly doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.parsed}` } } },
    cutout: '70%'
  };

  readonly barOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { callback: (v) => '$' + Number(v).toLocaleString('en', { notation: 'compact' }) }, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } }
    }
  };

  readonly lineOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { callback: (v) => '$' + Number(v).toLocaleString('en', { notation: 'compact' }) }, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } }
    },
    elements: { line: { tension: 0.4 } }
  };

  constructor(
    private customerSvc: CustomerService,
    private leadSvc: LeadService,
    private oppSvc: OpportunityService,
    private quoteSvc: QuoteService,
    private actSvc: ActivityService
  ) {}

  ngOnInit(): void {
    forkJoin({
      customers: this.customerSvc.getCustomers(),
      leads: this.leadSvc.getLeads(),
      opportunities: this.oppSvc.getOpportunities(),
      quotes: this.quoteSvc.getQuotes(),
      activities: this.actSvc.getActivities()
    }).subscribe(({ customers, leads, opportunities, quotes, activities }) => {
      this.customers.set(customers);
      this.leads.set(leads);
      this.opportunities.set(opportunities);
      this.quotes.set(quotes);
      this.activities.set(activities);
      this.computeKpis(leads, opportunities, quotes, activities);
      this.buildCharts(leads, opportunities);
    });
  }

  private computeKpis(leads: Lead[], opps: Opportunity[], quotes: Quote[], acts: Activity[]) {
    const open = leads.filter(l => l.status === 'New' || l.status === 'Qualified');
    this.openLeads.set(open.length);
    this.qualifiedLeads.set(leads.filter(l => l.status === 'Qualified').length);
    const converted = leads.filter(l => l.status === 'Converted');
    this.convertedLeads.set(converted.length);
    this.conversionRate.set(leads.length ? Math.round(converted.length / leads.length * 100) : 0);

    const openOpps = opps.filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage));
    this.openOpportunities.set(openOpps.length);
    this.wonOpps.set(opps.filter(o => o.stage === 'Closed Won').length);

    const pipeline = openOpps.reduce((sum, o) => sum + o.expectedRevenue * o.probability / 100, 0);
    this.revenuePipeline.set(pipeline);

    this.activeQuotes.set(quotes.filter(q => ['Draft', 'Submitted'].includes(q.status)).length);
    this.approvedQuotes.set(quotes.filter(q => q.status === 'Approved').length);

    this.topOpportunities.set(
      [...openOpps].sort((a, b) => b.expectedRevenue - a.expectedRevenue).slice(0, 6)
    );

    const upcoming = acts
      .filter(a => a.status !== 'Completed' && a.status !== 'Cancelled')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 6);
    this.recentActivities.set(upcoming);
  }

  private buildCharts(leads: Lead[], opps: Opportunity[]) {
    // Lead status doughnut
    const statuses = ['New', 'Qualified', 'Converted', 'Lost'];
    const colors = ['#0a6ed1', '#e8a000', '#107e3e', '#bb0000'];
    const statusCounts = statuses.map(s => leads.filter(l => l.status === s).length);
    this.leadChartData.set({
      labels: statuses,
      datasets: [{ data: statusCounts, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }]
    });
    this.leadLegend.set(statuses.map((s, i) => ({ label: s, color: colors[i], value: statusCounts[i] })));

    // Pipeline by stage
    const stages = ['Discovery', 'Qualification', 'Proposal', 'Negotiation'];
    const stageValues = stages.map(s => opps.filter(o => o.stage === s).reduce((sum, o) => sum + o.expectedRevenue, 0));
    this.pipelineChartData.set({
      labels: stages,
      datasets: [{
        data: stageValues,
        backgroundColor: ['#b9d9f5', '#ffd54f', '#0a6ed1', '#e8a000'],
        borderRadius: 6
      }]
    });

    // Revenue forecast (mock monthly)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const forecast = [120000, 185000, 210000, 280000, 320000, 415000, 490000, 560000, 680000, 720000];
    this.forecastChartData.set({
      labels: months,
      datasets: [{
        data: forecast,
        borderColor: '#0a6ed1',
        backgroundColor: 'rgba(10,110,209,.08)',
        fill: true,
        pointBackgroundColor: '#0a6ed1',
        pointRadius: 4
      }]
    });
  }

  activityIcon(type: string): string {
    const map: Record<string, string> = { Call: 'phone', Meeting: 'people', Email: 'email', Task: 'task_alt' };
    return map[type] ?? 'event';
  }

  probColor(prob: number): 'primary' | 'accent' | 'warn' {
    if (prob >= 70) return 'primary';
    if (prob >= 40) return 'accent';
    return 'warn';
  }
}
