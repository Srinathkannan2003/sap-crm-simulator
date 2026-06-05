import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { LeadService } from '../../core/services/lead.service';
import { OpportunityService } from '../../core/services/opportunity.service';
import { QuoteService } from '../../core/services/quote.service';
import { CustomerService } from '../../core/services/customer.service';
import { Lead, Opportunity, Quote, Customer } from '../../core/models';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Chart, BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend, ArcElement, DoughnutController, LineElement, LineController, PointElement, Filler } from 'chart.js';

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend, ArcElement, DoughnutController, LineElement, LineController, PointElement, Filler);

@Component({
  selector: 'app-reports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, FormsModule,
    MatButtonModule, MatIconModule, MatTabsModule,
    MatFormFieldModule, MatSelectModule, MatTableModule,
    BaseChartDirective
  ],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">Reports & Analytics</h1>
      <p class="page-subtitle">Sales performance insights and pipeline analysis</p>
    </div>
    <div class="page-actions">
      <mat-form-field appearance="outline" style="width:150px;margin-bottom:0">
        <mat-label>Period</mat-label>
        <mat-select [(ngModel)]="period" (ngModelChange)="buildCharts()">
          <mat-option value="q3">Q3 2024</mat-option>
          <mat-option value="q4">Q4 2024</mat-option>
          <mat-option value="ytd">YTD 2024</mat-option>
        </mat-select>
      </mat-form-field>
      <button mat-stroked-button (click)="exportReport()">
        <mat-icon>download</mat-icon> Export CSV
      </button>
    </div>
  </div>

  <!-- KPI summary -->
  <div class="kpi-grid" style="margin-bottom:1.5rem">
    <div class="kpi-card blue">
      <div class="kpi-icon"><mat-icon>track_changes</mat-icon></div>
      <div class="kpi-content">
        <div class="kpi-value">{{ leads().length }}</div>
        <div class="kpi-label">Total Leads</div>
        <div class="kpi-trend positive">{{ leadConvRate() }}% conversion</div>
      </div>
    </div>
    <div class="kpi-card green">
      <div class="kpi-icon"><mat-icon>trending_up</mat-icon></div>
      <div class="kpi-content">
        <div class="kpi-value">{{ wonOpps() }}</div>
        <div class="kpi-label">Won Deals</div>
        <div class="kpi-trend positive">{{ winRate() }}% win rate</div>
      </div>
    </div>
    <div class="kpi-card gold">
      <div class="kpi-icon"><mat-icon>attach_money</mat-icon></div>
      <div class="kpi-content">
        <div class="kpi-value">{{ wonRevenue() | currency:'USD':'symbol':'1.0-0' }}</div>
        <div class="kpi-label">Closed Revenue</div>
        <div class="kpi-trend positive">Confirmed wins</div>
      </div>
    </div>
    <div class="kpi-card purple">
      <div class="kpi-icon"><mat-icon>account_balance_wallet</mat-icon></div>
      <div class="kpi-content">
        <div class="kpi-value">{{ pipelineValue() | currency:'USD':'symbol':'1.0-0' }}</div>
        <div class="kpi-label">Open Pipeline</div>
        <div class="kpi-trend positive">Weighted forecast</div>
      </div>
    </div>
  </div>

  <mat-tab-group animationDuration="200ms">

    <!-- Lead Report -->
    <mat-tab label="📊 Lead Report">
      <div class="report-tab">
        <div class="report-charts-row">
          <div class="report-chart-card">
            <h3>Leads by Status</h3>
            @if (leadStatusChart().datasets[0].data.length) {
              <canvas baseChart [data]="leadStatusChart()" [options]="doughnutOpts" type="doughnut" style="max-height:220px"></canvas>
            }
          </div>
          <div class="report-chart-card wide">
            <h3>Leads by Industry</h3>
            @if (leadIndustryChart().datasets[0].data.length) {
              <canvas baseChart [data]="leadIndustryChart()" [options]="barOpts" type="bar" style="max-height:220px"></canvas>
            }
          </div>
          <div class="report-chart-card wide">
            <h3>Lead Value by Source</h3>
            @if (leadSourceChart().datasets[0].data.length) {
              <canvas baseChart [data]="leadSourceChart()" [options]="barOpts" type="bar" style="max-height:220px"></canvas>
            }
          </div>
        </div>

        <h3 style="margin:1.5rem 0 .75rem;font-size:1rem">Lead Details</h3>
        <div class="table-container">
          <table mat-table [dataSource]="leads()">
            <ng-container matColumnDef="id"><th mat-header-cell *matHeaderCellDef>ID</th><td mat-cell *matCellDef="let r"><span class="font-mono" style="font-size:.75rem;color:var(--text-secondary)">{{r.id}}</span></td></ng-container>
            <ng-container matColumnDef="title"><th mat-header-cell *matHeaderCellDef>Lead</th><td mat-cell *matCellDef="let r"><strong>{{r.title}}</strong><div style="font-size:.75rem;color:var(--text-secondary)">{{r.customerName}}</div></td></ng-container>
            <ng-container matColumnDef="source"><th mat-header-cell *matHeaderCellDef>Source</th><td mat-cell *matCellDef="let r">{{r.source}}</td></ng-container>
            <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let r"><span class="status-badge" [class]="r.status.toLowerCase()">{{r.status}}</span></td></ng-container>
            <ng-container matColumnDef="priority"><th mat-header-cell *matHeaderCellDef>Priority</th><td mat-cell *matCellDef="let r"><span class="status-badge" [class]="r.priority.toLowerCase()">{{r.priority}}</span></td></ng-container>
            <ng-container matColumnDef="estimatedValue"><th mat-header-cell *matHeaderCellDef>Est. Value</th><td mat-cell *matCellDef="let r" class="text-right">{{r.estimatedValue | currency:'USD':'symbol':'1.0-0'}}</td></ng-container>
            <ng-container matColumnDef="assignedRep"><th mat-header-cell *matHeaderCellDef>Rep</th><td mat-cell *matCellDef="let r">{{r.assignedRep}}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="leadCols"></tr>
            <tr mat-row *matRowDef="let r; columns: leadCols;"></tr>
          </table>
        </div>
      </div>
    </mat-tab>

    <!-- Opportunity Report -->
    <mat-tab label="📈 Opportunity Report">
      <div class="report-tab">
        <div class="report-charts-row">
          <div class="report-chart-card">
            <h3>Pipeline by Stage</h3>
            @if (oppStageChart().datasets[0].data.length) {
              <canvas baseChart [data]="oppStageChart()" [options]="doughnutOpts" type="doughnut" style="max-height:220px"></canvas>
            }
          </div>
          <div class="report-chart-card wide">
            <h3>Revenue by Stage</h3>
            @if (oppRevenueChart().datasets[0].data.length) {
              <canvas baseChart [data]="oppRevenueChart()" [options]="barRevOpts" type="bar" style="max-height:220px"></canvas>
            }
          </div>
          <div class="report-chart-card wide">
            <h3>Win/Loss Analysis</h3>
            @if (winLossChart().datasets[0].data.length) {
              <canvas baseChart [data]="winLossChart()" [options]="barOpts" type="bar" style="max-height:220px"></canvas>
            }
          </div>
        </div>

        <h3 style="margin:1.5rem 0 .75rem;font-size:1rem">Opportunity Details</h3>
        <div class="table-container">
          <table mat-table [dataSource]="opps()">
            <ng-container matColumnDef="id"><th mat-header-cell *matHeaderCellDef>ID</th><td mat-cell *matCellDef="let r"><span class="font-mono" style="font-size:.75rem;color:var(--text-secondary)">{{r.id}}</span></td></ng-container>
            <ng-container matColumnDef="title"><th mat-header-cell *matHeaderCellDef>Opportunity</th><td mat-cell *matCellDef="let r"><strong>{{r.title}}</strong><div style="font-size:.75rem;color:var(--text-secondary)">{{r.customerName}}</div></td></ng-container>
            <ng-container matColumnDef="stage"><th mat-header-cell *matHeaderCellDef>Stage</th><td mat-cell *matCellDef="let r"><span class="status-badge" [class]="r.stage.toLowerCase().replace(' ','-')">{{r.stage}}</span></td></ng-container>
            <ng-container matColumnDef="probability"><th mat-header-cell *matHeaderCellDef>Prob.</th><td mat-cell *matCellDef="let r" class="text-center">{{r.probability}}%</td></ng-container>
            <ng-container matColumnDef="expectedRevenue"><th mat-header-cell *matHeaderCellDef>Revenue</th><td mat-cell *matCellDef="let r" class="text-right">{{r.expectedRevenue | currency:'USD':'symbol':'1.0-0'}}</td></ng-container>
            <ng-container matColumnDef="expectedCloseDate"><th mat-header-cell *matHeaderCellDef>Close Date</th><td mat-cell *matCellDef="let r">{{r.expectedCloseDate}}</td></ng-container>
            <ng-container matColumnDef="assignedRep"><th mat-header-cell *matHeaderCellDef>Rep</th><td mat-cell *matCellDef="let r">{{r.assignedRep}}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="oppCols"></tr>
            <tr mat-row *matRowDef="let r; columns: oppCols;"></tr>
          </table>
        </div>
      </div>
    </mat-tab>

    <!-- Revenue Report -->
    <mat-tab label="💰 Revenue Report">
      <div class="report-tab">
        <div class="report-charts-row">
          <div class="report-chart-card" style="grid-column:1/-1">
            <h3>Monthly Revenue Forecast</h3>
            @if (revenueLineChart().datasets[0].data.length) {
              <canvas baseChart [data]="revenueLineChart()" [options]="lineOpts" type="line" style="max-height:280px"></canvas>
            }
          </div>
          <div class="report-chart-card">
            <h3>Revenue by Rep</h3>
            @if (repRevenueChart().datasets[0].data.length) {
              <canvas baseChart [data]="repRevenueChart()" [options]="barRevOpts" type="bar" style="max-height:220px"></canvas>
            }
          </div>
          <div class="report-chart-card wide">
            <h3>Quote Value by Status</h3>
            @if (quoteValueChart().datasets[0].data.length) {
              <canvas baseChart [data]="quoteValueChart()" [options]="barRevOpts" type="bar" style="max-height:220px"></canvas>
            }
          </div>
        </div>

        <!-- Revenue Summary Table -->
        <h3 style="margin:1.5rem 0 .75rem;font-size:1rem">Revenue Summary by Rep</h3>
        <div class="table-container">
          <table mat-table [dataSource]="revSummary()">
            <ng-container matColumnDef="rep"><th mat-header-cell *matHeaderCellDef>Sales Rep</th><td mat-cell *matCellDef="let r"><strong>{{r.rep}}</strong></td></ng-container>
            <ng-container matColumnDef="leads"><th mat-header-cell *matHeaderCellDef>Leads</th><td mat-cell *matCellDef="let r" class="text-center">{{r.leads}}</td></ng-container>
            <ng-container matColumnDef="opps"><th mat-header-cell *matHeaderCellDef>Opps</th><td mat-cell *matCellDef="let r" class="text-center">{{r.opps}}</td></ng-container>
            <ng-container matColumnDef="won"><th mat-header-cell *matHeaderCellDef>Won</th><td mat-cell *matCellDef="let r" class="text-center">{{r.won}}</td></ng-container>
            <ng-container matColumnDef="wonRevenue"><th mat-header-cell *matHeaderCellDef>Won Revenue</th><td mat-cell *matCellDef="let r" class="text-right">{{r.wonRevenue | currency:'USD':'symbol':'1.0-0'}}</td></ng-container>
            <ng-container matColumnDef="pipeline"><th mat-header-cell *matHeaderCellDef>Pipeline</th><td mat-cell *matCellDef="let r" class="text-right">{{r.pipeline | currency:'USD':'symbol':'1.0-0'}}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="revCols"></tr>
            <tr mat-row *matRowDef="let r; columns: revCols;"></tr>
          </table>
        </div>
      </div>
    </mat-tab>

  </mat-tab-group>
</div>
  `,
  styles: [`
    .report-tab { padding: 1.5rem 0; }
    .report-charts-row { display: grid; grid-template-columns: 280px 1fr 1fr; gap: 1.25rem; margin-bottom: 1rem; }
    .report-chart-card { background: var(--bg-white); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; box-shadow: var(--shadow-xs);
      h3 { font-size: .857rem; font-weight: 600; margin: 0 0 1rem; }
      &.wide { grid-column: span 1; }
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    @media (max-width: 1100px) { .report-charts-row { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 700px) { .report-charts-row { grid-template-columns: 1fr; } }
  `]
})
export class ReportsComponent implements OnInit {
  leads = signal<Lead[]>([]);
  opps = signal<Opportunity[]>([]);
  quotes = signal<Quote[]>([]);
  customers = signal<Customer[]>([]);

  period = 'ytd';

  leadStatusChart = signal<ChartData>({ labels: [], datasets: [{ data: [] }] });
  leadIndustryChart = signal<ChartData>({ labels: [], datasets: [{ data: [] }] });
  leadSourceChart = signal<ChartData>({ labels: [], datasets: [{ data: [] }] });
  oppStageChart = signal<ChartData>({ labels: [], datasets: [{ data: [] }] });
  oppRevenueChart = signal<ChartData>({ labels: [], datasets: [{ data: [] }] });
  winLossChart = signal<ChartData>({ labels: [], datasets: [{ data: [] }] });
  revenueLineChart = signal<ChartData>({ labels: [], datasets: [{ data: [] }] });
  repRevenueChart = signal<ChartData>({ labels: [], datasets: [{ data: [] }] });
  quoteValueChart = signal<ChartData>({ labels: [], datasets: [{ data: [] }] });
  revSummary = signal<{ rep: string; leads: number; opps: number; won: number; wonRevenue: number; pipeline: number }[]>([]);

  leadCols = ['id', 'title', 'source', 'status', 'priority', 'estimatedValue', 'assignedRep'];
  oppCols = ['id', 'title', 'stage', 'probability', 'expectedRevenue', 'expectedCloseDate', 'assignedRep'];
  revCols = ['rep', 'leads', 'opps', 'won', 'wonRevenue', 'pipeline'];

  wonOpps = () => this.opps().filter(o => o.stage === 'Closed Won').length;
  winRate = () => {
    const closed = this.opps().filter(o => o.stage === 'Closed Won' || o.stage === 'Closed Lost').length;
    return closed ? Math.round(this.wonOpps() / closed * 100) : 0;
  };
  wonRevenue = () => this.opps().filter(o => o.stage === 'Closed Won').reduce((s, o) => s + o.expectedRevenue, 0);
  pipelineValue = () => this.opps().filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage)).reduce((s, o) => s + o.expectedRevenue * o.probability / 100, 0);
  leadConvRate = () => this.leads().length ? Math.round(this.leads().filter(l => l.status === 'Converted').length / this.leads().length * 100) : 0;

  readonly doughnutOpts: ChartConfiguration<'doughnut'>['options'] = { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } }, cutout: '60%' };
  readonly barOpts: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f0f0f0' } } } };
  readonly barRevOpts: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f0f0f0' }, ticks: { callback: (v) => '$' + Number(v).toLocaleString('en', { notation: 'compact' }) } } } };
  readonly lineOpts: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f0f0f0' }, ticks: { callback: (v) => '$' + Number(v).toLocaleString('en', { notation: 'compact' }) } } }, elements: { line: { tension: 0.4 } } };

  constructor(
    private leadSvc: LeadService,
    private oppSvc: OpportunityService,
    private quoteSvc: QuoteService,
    private customerSvc: CustomerService
  ) {}

  ngOnInit(): void {
    forkJoin({
      leads: this.leadSvc.getLeads(),
      opps: this.oppSvc.getOpportunities(),
      quotes: this.quoteSvc.getQuotes(),
      customers: this.customerSvc.getCustomers()
    }).subscribe(({ leads, opps, quotes, customers }) => {
      this.leads.set(leads);
      this.opps.set(opps);
      this.quotes.set(quotes);
      this.customers.set(customers);
      this.buildCharts();
    });
  }

  buildCharts(): void {
    const leads = this.leads();
    const opps = this.opps();
    const quotes = this.quotes();

    // Lead status doughnut
    const statuses = ['New', 'Qualified', 'Converted', 'Lost'];
    this.leadStatusChart.set({
      labels: statuses,
      datasets: [{ data: statuses.map(s => leads.filter(l => l.status === s).length), backgroundColor: ['#0a6ed1', '#e8a000', '#107e3e', '#bb0000'], borderWidth: 0 }]
    });

    // Lead by industry (bar)
    const industries = [...new Set(leads.map(l => l.industry))].filter(Boolean).slice(0, 8);
    this.leadIndustryChart.set({
      labels: industries,
      datasets: [{ data: industries.map(i => leads.filter(l => l.industry === i).length), backgroundColor: '#b9d9f5', borderRadius: 4 }]
    });

    // Lead value by source
    const sources = [...new Set(leads.map(l => l.source))].filter(Boolean).slice(0, 7);
    this.leadSourceChart.set({
      labels: sources,
      datasets: [{ data: sources.map(s => leads.filter(l => l.source === s).reduce((sum, l) => sum + l.estimatedValue, 0)), backgroundColor: '#0a6ed1', borderRadius: 4 }]
    });

    // Opp stage doughnut
    const stages = ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    this.oppStageChart.set({
      labels: stages,
      datasets: [{ data: stages.map(s => opps.filter(o => o.stage === s).length), backgroundColor: ['#0a6ed1', '#e8a000', '#6b3fa0', '#e76500', '#107e3e', '#bb0000'], borderWidth: 0 }]
    });

    // Opp revenue by stage
    this.oppRevenueChart.set({
      labels: stages.slice(0, 4),
      datasets: [{ data: stages.slice(0, 4).map(s => opps.filter(o => o.stage === s).reduce((sum, o) => sum + o.expectedRevenue, 0)), backgroundColor: ['#b9d9f5', '#ffd54f', '#d7b4f3', '#ffb74d'], borderRadius: 6 }]
    });

    // Win/Loss
    this.winLossChart.set({
      labels: ['Closed Won', 'Closed Lost', 'In Progress'],
      datasets: [{ data: [
        opps.filter(o => o.stage === 'Closed Won').length,
        opps.filter(o => o.stage === 'Closed Lost').length,
        opps.filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage)).length
      ], backgroundColor: ['#107e3e', '#bb0000', '#0a6ed1'], borderRadius: 6 }]
    });

    // Revenue forecast line
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const forecast = [98000, 145000, 180000, 240000, 310000, 390000, 460000, 520000, 640000, 710000, 790000, 850000];
    this.revenueLineChart.set({
      labels: months,
      datasets: [{ data: forecast, borderColor: '#0a6ed1', backgroundColor: 'rgba(10,110,209,.08)', fill: true, pointBackgroundColor: '#0a6ed1', pointRadius: 4 }]
    });

    // Revenue by rep
    const reps = ['James Chen', 'Priya Patel'];
    this.repRevenueChart.set({
      labels: reps,
      datasets: [{ data: reps.map(r => opps.filter(o => o.assignedRep === r && o.stage === 'Closed Won').reduce((s, o) => s + o.expectedRevenue, 0)), backgroundColor: ['#0a6ed1', '#107e3e'], borderRadius: 6 }]
    });

    // Quote value by status
    const qStatuses = ['Draft', 'Submitted', 'Approved', 'Rejected'];
    this.quoteValueChart.set({
      labels: qStatuses,
      datasets: [{ data: qStatuses.map(s => quotes.filter(q => q.status === s).reduce((sum, q) => sum + q.total, 0)), backgroundColor: ['#b9d9f5', '#ffd54f', '#107e3e', '#bb0000'], borderRadius: 6 }]
    });

    // Rev summary
    this.revSummary.set(reps.map(rep => ({
      rep,
      leads: leads.filter(l => l.assignedRep === rep).length,
      opps: opps.filter(o => o.assignedRep === rep).length,
      won: opps.filter(o => o.assignedRep === rep && o.stage === 'Closed Won').length,
      wonRevenue: opps.filter(o => o.assignedRep === rep && o.stage === 'Closed Won').reduce((s, o) => s + o.expectedRevenue, 0),
      pipeline: opps.filter(o => o.assignedRep === rep && !['Closed Won', 'Closed Lost'].includes(o.stage)).reduce((s, o) => s + o.expectedRevenue * o.probability / 100, 0)
    })));
  }

  exportReport(): void {
    const rows = this.opps();
    const header = 'ID,Title,Customer,Stage,Probability,Revenue,Close Date,Rep\n';
    const body = rows.map(r => `${r.id},"${r.title}","${r.customerName}",${r.stage},${r.probability},${r.expectedRevenue},${r.expectedCloseDate},${r.assignedRep}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'opportunity-report.csv'; a.click();
  }
}
