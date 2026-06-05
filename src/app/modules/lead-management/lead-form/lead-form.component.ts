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
import { LeadService } from '../../../core/services/lead.service';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer, Lead } from '../../../core/models';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">{{ isEdit() ? 'Edit Lead' : 'New Lead' }}</h1>
      <p class="page-subtitle">{{ isEdit() ? 'Update lead information' : 'Capture a new sales lead' }}</p>
    </div>
    <div class="page-actions">
      <button mat-stroked-button routerLink="/leads"><mat-icon>arrow_back</mat-icon> Back</button>
    </div>
  </div>

  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <div class="form-section">
      <div class="section-title"><mat-icon>track_changes</mat-icon> Lead Information</div>
      <div class="form-grid three-col">
        <mat-form-field appearance="outline" style="grid-column:1/-1">
          <mat-label>Lead Title *</mat-label>
          <input matInput formControlName="title" placeholder="e.g. Enterprise ERP Upgrade">
          @if (form.get('title')?.invalid && form.get('title')?.touched) {
            <mat-error>Title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Customer *</mat-label>
          <mat-select formControlName="customerId" (selectionChange)="onCustomerChange($event.value)">
            @for (c of customers(); track c.id) {
              <mat-option [value]="c.id">{{ c.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="New">New</mat-option>
            <mat-option value="Qualified">Qualified</mat-option>
            <mat-option value="Converted">Converted</mat-option>
            <mat-option value="Lost">Lost</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Priority</mat-label>
          <mat-select formControlName="priority">
            <mat-option value="Low">Low</mat-option>
            <mat-option value="Medium">Medium</mat-option>
            <mat-option value="High">High</mat-option>
            <mat-option value="Critical">Critical</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Lead Source</mat-label>
          <mat-select formControlName="source">
            @for (s of sources; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Campaign</mat-label>
          <input matInput formControlName="campaign">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Assigned Rep</mat-label>
          <mat-select formControlName="assignedRep">
            <mat-option value="James Chen">James Chen</mat-option>
            <mat-option value="Priya Patel">Priya Patel</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Estimated Value (USD)</mat-label>
          <mat-icon matPrefix>attach_money</mat-icon>
          <input matInput type="number" formControlName="estimatedValue">
        </mat-form-field>
      </div>
    </div>

    <div class="form-section">
      <div class="section-title"><mat-icon>person</mat-icon> Contact Person</div>
      <div class="form-grid three-col">
        <mat-form-field appearance="outline">
          <mat-label>Contact Name</mat-label>
          <input matInput formControlName="contactName">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Contact Email</mat-label>
          <input matInput formControlName="contactEmail" type="email">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Contact Phone</mat-label>
          <input matInput formControlName="contactPhone">
        </mat-form-field>
      </div>
    </div>

    <div class="form-section">
      <div class="section-title"><mat-icon>description</mat-icon> Description</div>
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Lead Description</mat-label>
        <textarea matInput formControlName="description" rows="4"></textarea>
      </mat-form-field>
    </div>

    <div class="form-actions">
      <button mat-stroked-button type="button" routerLink="/leads">Cancel</button>
      <button mat-flat-button color="primary" type="submit" [disabled]="saving()">
        @if (saving()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:8px"></mat-spinner> }
        <mat-icon>{{ isEdit() ? 'save' : 'add' }}</mat-icon>
        {{ isEdit() ? 'Save Changes' : 'Create Lead' }}
      </button>
    </div>
  </form>
</div>
  `,
  styles: [`.form-actions { display:flex; justify-content:flex-end; gap:.75rem; padding:1rem 0; }`]
})
export class LeadFormComponent implements OnInit {
  isEdit = signal(false);
  saving = signal(false);
  customers = signal<Customer[]>([]);

  sources = ['Trade Show', 'Website', 'Referral', 'Cold Call', 'Partner', 'Email Campaign', 'LinkedIn', 'Industry Event', 'Inbound'];

  form = this.fb.group({
    title: ['', Validators.required],
    customerId: ['', Validators.required],
    customerName: [''],
    contactName: [''], contactEmail: [''], contactPhone: [''],
    source: ['Website'], status: ['New'], priority: ['Medium'],
    assignedRep: [''], estimatedValue: [0],
    description: [''], campaign: [''], industry: ['']
  });

  private leadId = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private leadSvc: LeadService,
    private customerSvc: CustomerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.customerSvc.getCustomers().subscribe(c => this.customers.set(c));
    this.leadId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.leadId && this.leadId !== 'new') {
      this.isEdit.set(true);
      this.leadSvc.getLead(this.leadId).subscribe(l => this.form.patchValue(l));
    }
  }

  onCustomerChange(id: string): void {
    const c = this.customers().find(x => x.id === id);
    if (c) this.form.patchValue({ customerName: c.name, industry: c.industry });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value as Partial<Lead>;
    const obs = this.isEdit()
      ? this.leadSvc.updateLead(this.leadId, val)
      : this.leadSvc.createLead(val);
    obs.subscribe({
      next: (l) => {
        this.saving.set(false);
        this.snackBar.open(this.isEdit() ? 'Lead updated' : 'Lead created', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/leads', l.id]);
      },
      error: () => { this.saving.set(false); this.snackBar.open('Error saving lead', 'Dismiss', { duration: 4000 }); }
    });
  }
}
