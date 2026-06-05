import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer, Opportunity } from '../../../core/models';

@Component({
  selector: 'app-opp-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatSliderModule, MatChipsModule
  ],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">{{ isEdit() ? 'Edit Opportunity' : 'New Opportunity' }}</h1>
      <p class="page-subtitle">{{ isEdit() ? 'Update opportunity details' : 'Create a new sales opportunity' }}</p>
    </div>
    <div class="page-actions">
      <button mat-stroked-button routerLink="/opportunities"><mat-icon>arrow_back</mat-icon> Back</button>
    </div>
  </div>

  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <div class="form-section">
      <div class="section-title"><mat-icon>trending_up</mat-icon> Opportunity Details</div>
      <div class="form-grid three-col">
        <mat-form-field appearance="outline" style="grid-column:1/-1">
          <mat-label>Opportunity Title *</mat-label>
          <input matInput formControlName="title">
          @if (form.get('title')?.invalid && form.get('title')?.touched) {
            <mat-error>Title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Customer *</mat-label>
          <mat-select formControlName="customerId" (selectionChange)="onCustomerChange($event.value)">
            @for (c of customers(); track c.id) { <mat-option [value]="c.id">{{ c.name }}</mat-option> }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Stage</mat-label>
          <mat-select formControlName="stage" (selectionChange)="onStageChange($event.value)">
            <mat-option value="Discovery">Discovery</mat-option>
            <mat-option value="Qualification">Qualification</mat-option>
            <mat-option value="Proposal">Proposal</mat-option>
            <mat-option value="Negotiation">Negotiation</mat-option>
            <mat-option value="Closed Won">Closed Won</mat-option>
            <mat-option value="Closed Lost">Closed Lost</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Assigned Rep</mat-label>
          <mat-select formControlName="assignedRep">
            <mat-option value="James Chen">James Chen</mat-option>
            <mat-option value="Priya Patel">Priya Patel</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Expected Revenue (USD)</mat-label>
          <mat-icon matPrefix>attach_money</mat-icon>
          <input matInput type="number" formControlName="expectedRevenue">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Expected Close Date</mat-label>
          <input matInput type="date" formControlName="expectedCloseDate">
        </mat-form-field>

        <div class="prob-field">
          <label class="prob-label">Win Probability: <strong>{{ form.get('probability')?.value }}%</strong></label>
          <mat-slider min="0" max="100" step="5" style="width:100%">
            <input matSliderThumb formControlName="probability">
          </mat-slider>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="section-title"><mat-icon>description</mat-icon> Details & Context</div>
      <div class="form-grid two-col">
        <mat-form-field appearance="outline">
          <mat-label>Competitor Info</mat-label>
          <input matInput formControlName="competitorInfo" placeholder="e.g. Salesforce, Oracle">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Next Steps</mat-label>
          <input matInput formControlName="nextSteps">
        </mat-form-field>
        <mat-form-field appearance="outline" style="grid-column:1/-1">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </div>
    </div>

    <div class="form-actions">
      <button mat-stroked-button type="button" routerLink="/opportunities">Cancel</button>
      <button mat-flat-button color="primary" type="submit" [disabled]="saving()">
        @if (saving()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:8px"></mat-spinner> }
        <mat-icon>{{ isEdit() ? 'save' : 'add' }}</mat-icon>
        {{ isEdit() ? 'Save Changes' : 'Create Opportunity' }}
      </button>
    </div>
  </form>
</div>
  `,
  styles: [`
    .form-actions { display:flex; justify-content:flex-end; gap:.75rem; padding:1rem 0; }
    .prob-field { display:flex; flex-direction:column; gap:.25rem; padding:.25rem 0; }
    .prob-label { font-size:.875rem; font-weight:500; color:var(--text-secondary); }
  `]
})
export class OppFormComponent implements OnInit {
  isEdit = signal(false);
  saving = signal(false);
  customers = signal<Customer[]>([]);

  private oppId = '';

  form = this.fb.group({
    title: ['', Validators.required],
    customerId: ['', Validators.required],
    customerName: [''],
    stage: ['Discovery'],
    probability: [25],
    expectedRevenue: [0],
    expectedCloseDate: [''],
    assignedRep: [''],
    description: [''],
    competitorInfo: [''],
    nextSteps: [''],
    products: [[]]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private oppSvc: OpportunityService,
    private customerSvc: CustomerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.customerSvc.getCustomers().subscribe(c => this.customers.set(c));
    this.oppId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.oppId && this.oppId !== 'new') {
      this.isEdit.set(true);
      this.oppSvc.getOpportunity(this.oppId).subscribe(o => this.form.patchValue(o as any));
    }
  }

  onCustomerChange(id: string): void {
    const c = this.customers().find(x => x.id === id);
    if (c) this.form.patchValue({ customerName: c.name });
  }

  onStageChange(stage: string): void {
    const probMap: Record<string, number> = {
      Discovery: 20, Qualification: 40, Proposal: 60, Negotiation: 80, 'Closed Won': 100, 'Closed Lost': 0
    };
    this.form.patchValue({ probability: probMap[stage] ?? 25 });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value as Partial<Opportunity>;
    const obs = this.isEdit()
      ? this.oppSvc.updateOpportunity(this.oppId, val)
      : this.oppSvc.createOpportunity(val);
    obs.subscribe({
      next: (o) => {
        this.saving.set(false);
        this.snackBar.open(this.isEdit() ? 'Opportunity updated' : 'Opportunity created', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/opportunities', o.id]);
      },
      error: () => { this.saving.set(false); this.snackBar.open('Error saving', 'Dismiss', { duration: 4000 }); }
    });
  }
}
