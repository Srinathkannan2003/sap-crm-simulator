import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models';

@Component({
  selector: 'app-bp-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">{{ isEdit() ? 'Edit Customer' : 'New Customer' }}</h1>
      <p class="page-subtitle">{{ isEdit() ? 'Update business partner details' : 'Create a new business partner record' }}</p>
    </div>
    <div class="page-actions">
      <button mat-stroked-button routerLink="/customers">
        <mat-icon>arrow_back</mat-icon> Back
      </button>
    </div>
  </div>

  @if (loading()) {
    <div class="loading-overlay" style="position:relative;height:200px">
      <mat-spinner diameter="40"></mat-spinner>
    </div>
  } @else {
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <!-- Basic Info -->
      <div class="form-section">
        <div class="section-title"><mat-icon>business</mat-icon> Company Information</div>
        <div class="form-grid three-col">
          <mat-form-field appearance="outline">
            <mat-label>Company Name *</mat-label>
            <input matInput formControlName="name" placeholder="e.g. Acme Corporation">
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <mat-error>Company name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Industry *</mat-label>
            <mat-select formControlName="industry">
              @for (ind of industries; track ind) {
                <mat-option [value]="ind">{{ ind }}</mat-option>
              }
            </mat-select>
            @if (form.get('industry')?.invalid && form.get('industry')?.touched) {
              <mat-error>Industry is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Account Type *</mat-label>
            <mat-select formControlName="accountType">
              <mat-option value="Enterprise">Enterprise</mat-option>
              <mat-option value="Mid-Market">Mid-Market</mat-option>
              <mat-option value="SMB">SMB</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Annual Revenue (USD)</mat-label>
            <mat-icon matPrefix>attach_money</mat-icon>
            <input matInput type="number" formControlName="revenue" placeholder="e.g. 5000000">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Employees</mat-label>
            <mat-icon matPrefix>group</mat-icon>
            <input matInput type="number" formControlName="employees" placeholder="e.g. 250">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Website</mat-label>
            <mat-icon matPrefix>language</mat-icon>
            <input matInput formControlName="website" placeholder="www.example.com">
          </mat-form-field>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="form-section">
        <div class="section-title"><mat-icon>contact_mail</mat-icon> Contact Information</div>
        <div class="form-grid three-col">
          <mat-form-field appearance="outline">
            <mat-label>Email *</mat-label>
            <mat-icon matPrefix>email</mat-icon>
            <input matInput formControlName="email" type="email" placeholder="contact@company.com">
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <mat-error>Valid email is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Phone</mat-label>
            <mat-icon matPrefix>phone</mat-icon>
            <input matInput formControlName="phone" placeholder="+1-555-0100">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Assigned Sales Rep</mat-label>
            <mat-select formControlName="assignedRep">
              <mat-option value="James Chen">James Chen</mat-option>
              <mat-option value="Priya Patel">Priya Patel</mat-option>
              <mat-option value="Sarah Mitchell">Sarah Mitchell</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <!-- Address -->
      <div class="form-section">
        <div class="section-title"><mat-icon>location_on</mat-icon> Address</div>
        <div class="form-grid three-col">
          <mat-form-field appearance="outline" style="grid-column:1/-1">
            <mat-label>Street Address</mat-label>
            <input matInput formControlName="street" placeholder="123 Main Street">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>City</mat-label>
            <input matInput formControlName="city">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>State</mat-label>
            <input matInput formControlName="state" placeholder="CA">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>ZIP Code</mat-label>
            <input matInput formControlName="zip">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Country</mat-label>
            <input matInput formControlName="country">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Inactive">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <!-- Notes -->
      <div class="form-section">
        <div class="section-title"><mat-icon>notes</mat-icon> Notes</div>
        <mat-form-field appearance="outline" style="width:100%">
          <mat-label>Additional Notes</mat-label>
          <textarea matInput formControlName="notes" rows="4" placeholder="Enter any additional notes about this customer…"></textarea>
        </mat-form-field>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button mat-stroked-button type="button" routerLink="/customers">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="saving()">
          @if (saving()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:8px"></mat-spinner> }
          <mat-icon>{{ isEdit() ? 'save' : 'add' }}</mat-icon>
          {{ isEdit() ? 'Save Changes' : 'Create Customer' }}
        </button>
      </div>
    </form>
  }
</div>
  `,
  styles: [`
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: .75rem;
      padding: 1rem 0;
    }
  `]
})
export class BpFormComponent implements OnInit {
  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);

  industries = [
    'Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail',
    'Logistics', 'Energy', 'Aerospace', 'Automotive', 'Pharmaceuticals',
    'Telecommunications', 'Construction', 'Education', 'Food & Beverage', 'Agriculture', 'Software'
  ];

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    industry: ['', Validators.required],
    accountType: ['Mid-Market', Validators.required],
    revenue: [0],
    employees: [0],
    website: [''],
    street: [''],
    city: [''],
    state: [''],
    zip: [''],
    country: ['USA'],
    status: ['Active'],
    assignedRep: [''],
    notes: ['']
  });

  private customerId = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private customerSvc: CustomerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.customerId && this.customerId !== 'new') {
      this.isEdit.set(true);
      this.loading.set(true);
      this.customerSvc.getCustomer(this.customerId).subscribe(c => {
        this.form.patchValue(c);
        this.loading.set(false);
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value as Partial<Customer>;
    const obs = this.isEdit()
      ? this.customerSvc.updateCustomer(this.customerId, val)
      : this.customerSvc.createCustomer(val);

    obs.subscribe({
      next: (c) => {
        this.saving.set(false);
        this.snackBar.open(
          this.isEdit() ? 'Customer updated successfully' : 'Customer created successfully',
          'Dismiss', { duration: 3000 }
        );
        this.router.navigate(['/customers', c.id]);
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('An error occurred. Please try again.', 'Dismiss', { duration: 4000 });
      }
    });
  }
}
