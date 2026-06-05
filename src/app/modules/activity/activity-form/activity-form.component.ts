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
import { ActivityService } from '../../../core/services/activity.service';
import { CustomerService } from '../../../core/services/customer.service';
import { OpportunityService } from '../../../core/services/opportunity.service';
import { Activity, Customer, Opportunity } from '../../../core/models';

@Component({
  selector: 'app-activity-form',
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
      <h1 class="page-title">{{ isEdit() ? 'Edit Activity' : 'Schedule Activity' }}</h1>
      <p class="page-subtitle">{{ isEdit() ? 'Update activity details' : 'Schedule a new call, meeting, email or task' }}</p>
    </div>
    <div class="page-actions">
      <button mat-stroked-button routerLink="/activities"><mat-icon>arrow_back</mat-icon> Back</button>
    </div>
  </div>

  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <div class="form-section">
      <div class="section-title"><mat-icon>event</mat-icon> Activity Details</div>
      <div class="form-grid three-col">
        <mat-form-field appearance="outline">
          <mat-label>Activity Type *</mat-label>
          <mat-select formControlName="type">
            <mat-option value="Call">📞 Call</mat-option>
            <mat-option value="Meeting">👥 Meeting</mat-option>
            <mat-option value="Email">📧 Email</mat-option>
            <mat-option value="Task">✅ Task</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="grid-column:2/4">
          <mat-label>Subject *</mat-label>
          <input matInput formControlName="subject" placeholder="e.g. Product Demo Call">
          @if (form.get('subject')?.invalid && form.get('subject')?.touched) {
            <mat-error>Subject is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Customer</mat-label>
          <mat-select formControlName="customerId" (selectionChange)="onCustomerChange($event.value)">
            <mat-option value="">-- None --</mat-option>
            @for (c of customers(); track c.id) { <mat-option [value]="c.id">{{ c.name }}</mat-option> }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Related Opportunity</mat-label>
          <mat-select formControlName="opportunityId">
            <mat-option value="">-- None --</mat-option>
            @for (o of opportunities(); track o.id) { <mat-option [value]="o.id">{{ o.title }}</mat-option> }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Assigned To</mat-label>
          <mat-select formControlName="assignedTo">
            <mat-option value="James Chen">James Chen</mat-option>
            <mat-option value="Priya Patel">Priya Patel</mat-option>
            <mat-option value="Sarah Mitchell">Sarah Mitchell</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Due Date *</mat-label>
          <input matInput type="date" formControlName="dueDate">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Duration (minutes)</mat-label>
          <input matInput type="number" formControlName="duration">
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
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="Scheduled">Scheduled</mat-option>
            <mat-option value="In Progress">In Progress</mat-option>
            <mat-option value="Completed">Completed</mat-option>
            <mat-option value="Cancelled">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </div>

    <div class="form-section">
      <div class="section-title"><mat-icon>notes</mat-icon> Notes & Outcome</div>
      <div class="form-grid two-col">
        <mat-form-field appearance="outline" style="grid-column:1/-1">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Activity description and agenda…"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline" style="grid-column:1/-1">
          <mat-label>Outcome</mat-label>
          <textarea matInput formControlName="outcome" rows="2" placeholder="Outcome / follow-up notes (fill after completion)…"></textarea>
        </mat-form-field>
      </div>
    </div>

    <div class="form-actions">
      <button mat-stroked-button type="button" routerLink="/activities">Cancel</button>
      <button mat-flat-button color="primary" type="submit" [disabled]="saving()">
        @if (saving()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:8px"></mat-spinner> }
        <mat-icon>{{ isEdit() ? 'save' : 'event' }}</mat-icon>
        {{ isEdit() ? 'Save Changes' : 'Schedule Activity' }}
      </button>
    </div>
  </form>
</div>
  `,
  styles: [`.form-actions { display:flex; justify-content:flex-end; gap:.75rem; padding:1rem 0; }`]
})
export class ActivityFormComponent implements OnInit {
  isEdit = signal(false);
  saving = signal(false);
  customers = signal<Customer[]>([]);
  opportunities = signal<Opportunity[]>([]);

  private actId = '';

  form = this.fb.group({
    type: ['Call', Validators.required],
    subject: ['', Validators.required],
    description: [''],
    customerId: [''],
    customerName: ['Internal'],
    opportunityId: [''],
    assignedTo: [''],
    status: ['Scheduled'],
    priority: ['Medium'],
    dueDate: ['', Validators.required],
    duration: [60],
    outcome: ['']
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private actSvc: ActivityService,
    private customerSvc: CustomerService,
    private oppSvc: OpportunityService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.customerSvc.getCustomers().subscribe(c => this.customers.set(c));
    this.oppSvc.getOpportunities().subscribe(o => this.opportunities.set(o));
    this.actId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.actId && this.actId !== 'new') {
      this.isEdit.set(true);
      this.actSvc.getActivity(this.actId).subscribe(a => this.form.patchValue(a));
    }
  }

  onCustomerChange(id: string): void {
    const c = this.customers().find(x => x.id === id);
    this.form.patchValue({ customerName: c?.name ?? 'Internal' });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value as Partial<Activity>;
    const obs = this.isEdit()
      ? this.actSvc.updateActivity(this.actId, val)
      : this.actSvc.createActivity(val);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open(this.isEdit() ? 'Activity updated' : 'Activity scheduled', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/activities']);
      },
      error: () => { this.saving.set(false); this.snackBar.open('Error saving', 'Dismiss', { duration: 4000 }); }
    });
  }
}
