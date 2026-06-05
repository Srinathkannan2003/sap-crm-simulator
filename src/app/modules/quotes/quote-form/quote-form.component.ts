import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { QuoteService } from '../../../core/services/quote.service';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer, Product, Quote } from '../../../core/models';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatDividerModule
  ],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">{{ isEdit() ? 'Edit Quote' : 'New Quote' }}</h1>
      <p class="page-subtitle">{{ isEdit() ? 'Update quote details and line items' : 'Create a new sales quote with products and pricing' }}</p>
    </div>
    <div class="page-actions">
      <button mat-stroked-button routerLink="/quotes"><mat-icon>arrow_back</mat-icon> Back</button>
    </div>
  </div>

  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <!-- Header info -->
    <div class="form-section">
      <div class="section-title"><mat-icon>request_quote</mat-icon> Quote Information</div>
      <div class="form-grid three-col">
        <mat-form-field appearance="outline" style="grid-column:1/-1">
          <mat-label>Quote Title *</mat-label>
          <input matInput formControlName="title" placeholder="e.g. SAP Analytics Cloud - Enterprise License">
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
          @if (form.get('customerId')?.invalid && form.get('customerId')?.touched) {
            <mat-error>Customer is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Assigned Rep</mat-label>
          <mat-select formControlName="assignedRep">
            <mat-option value="James Chen">James Chen</mat-option>
            <mat-option value="Priya Patel">Priya Patel</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Valid Until</mat-label>
          <input matInput type="date" formControlName="validUntil">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Currency</mat-label>
          <mat-select formControlName="currency">
            <mat-option value="USD">USD – US Dollar</mat-option>
            <mat-option value="EUR">EUR – Euro</mat-option>
            <mat-option value="GBP">GBP – British Pound</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tax Rate (%)</mat-label>
          <input matInput type="number" formControlName="taxRate" (input)="recalculate()">
        </mat-form-field>
      </div>
    </div>

    <!-- Line Items -->
    <div class="form-section">
      <div class="section-title">
        <mat-icon>inventory_2</mat-icon> Line Items
        <button type="button" mat-stroked-button (click)="addLine()" style="margin-left:auto;font-size:.786rem">
          <mat-icon>add</mat-icon> Add Product
        </button>
      </div>

      <div class="line-items-table">
        <div class="li-header">
          <span style="flex:2">Product / Description</span>
          <span style="width:80px;text-align:center">Qty</span>
          <span style="width:130px;text-align:right">Unit Price</span>
          <span style="width:80px;text-align:center">Disc %</span>
          <span style="width:130px;text-align:right">Line Total</span>
          <span style="width:40px"></span>
        </div>

        <div formArrayName="lineItems">
          @for (item of lineItems.controls; track $index; let i = $index) {
            <div [formGroupName]="i" class="li-row">
              <mat-form-field appearance="outline" style="flex:2">
                <mat-select formControlName="productId" (selectionChange)="onProductSelect(i, $event.value)" placeholder="Select product">
                  @for (p of products(); track p.id) {
                    <mat-option [value]="p.id">{{ p.name }}</mat-option>
                  }
                  <mat-option value="custom">Custom Item</mat-option>
                </mat-select>
              </mat-form-field>

              @if (lineItems.at(i).get('productId')?.value === 'custom') {
                <mat-form-field appearance="outline" style="flex:2;margin-left:4px">
                  <input matInput formControlName="product" placeholder="Custom product name">
                </mat-form-field>
              }

              <mat-form-field appearance="outline" style="width:80px">
                <input matInput type="number" formControlName="quantity" min="1" (input)="recalcLineTotal(i)">
              </mat-form-field>

              <mat-form-field appearance="outline" style="width:130px">
                <mat-icon matPrefix style="font-size:16px;width:16px">attach_money</mat-icon>
                <input matInput type="number" formControlName="unitPrice" (input)="recalcLineTotal(i)">
              </mat-form-field>

              <mat-form-field appearance="outline" style="width:80px">
                <input matInput type="number" formControlName="discount" min="0" max="100" (input)="recalcLineTotal(i)">
                <span matSuffix>%</span>
              </mat-form-field>

              <div class="li-total">
                {{ lineItems.at(i).get('total')?.value | currency:'USD':'symbol':'1.0-0' }}
              </div>

              <button type="button" mat-icon-button color="warn" (click)="removeLine(i)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          }
        </div>

        @if (!lineItems.length) {
          <div class="li-empty">
            <mat-icon>add_shopping_cart</mat-icon>
            <span>No products added. Click "Add Product" to start.</span>
          </div>
        }
      </div>

      <!-- Totals -->
      <div class="quote-totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>{{ subtotal() | currency:'USD':'symbol':'1.2-2' }}</span>
        </div>
        <div class="total-row">
          <span>Discount</span>
          <span class="discount">- {{ discountTotal() | currency:'USD':'symbol':'1.2-2' }}</span>
        </div>
        <div class="total-row">
          <span>Tax ({{ form.get('taxRate')?.value }}%)</span>
          <span>{{ taxAmount() | currency:'USD':'symbol':'1.2-2' }}</span>
        </div>
        <mat-divider></mat-divider>
        <div class="total-row grand-total">
          <span>Total</span>
          <span>{{ grandTotal() | currency:'USD':'symbol':'1.2-2' }}</span>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div class="form-section">
      <div class="section-title"><mat-icon>notes</mat-icon> Notes</div>
      <mat-form-field appearance="outline" style="width:100%">
        <textarea matInput formControlName="notes" rows="3" placeholder="Additional notes, terms, or conditions…"></textarea>
      </mat-form-field>
    </div>

    <div class="form-actions">
      <button mat-stroked-button type="button" routerLink="/quotes">Cancel</button>
      <button mat-flat-button type="submit" [disabled]="saving()">
        @if (saving()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:8px"></mat-spinner> }
        <mat-icon>save</mat-icon>
        {{ isEdit() ? 'Save Changes' : 'Create Quote' }}
      </button>
    </div>
  </form>
</div>
  `,
  styles: [`
    .form-actions { display:flex; justify-content:flex-end; gap:.75rem; padding:1rem 0; }

    .line-items-table {
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .li-header {
      display: flex;
      gap: .5rem;
      align-items: center;
      padding: .625rem 1rem;
      background: #f7f8fa;
      border-bottom: 1px solid var(--border-subtle);
      font-size: .714rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .05em;
      color: var(--text-secondary);
    }

    .li-row {
      display: flex;
      gap: .5rem;
      align-items: center;
      padding: .5rem 1rem;
      border-bottom: 1px solid var(--border-subtle);
      &:last-child { border-bottom: none; }
      mat-form-field { margin-bottom: -1.25em; }
    }

    .li-total {
      width: 130px;
      text-align: right;
      font-weight: 700;
      font-size: .875rem;
      color: var(--text-primary);
    }

    .li-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .75rem;
      padding: 2rem;
      color: var(--text-muted);
      font-size: .875rem;
      mat-icon { font-size: 28px; width: 28px; height: 28px; opacity: .4; }
    }

    .quote-totals {
      margin-top: 1.25rem;
      margin-left: auto;
      width: 360px;
      display: flex;
      flex-direction: column;
      gap: .5rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: .929rem;
      color: var(--text-secondary);
      .discount { color: var(--sap-green); }
    }

    .grand-total {
      font-size: 1.143rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-top: .25rem;
    }
  `]
})
export class QuoteFormComponent implements OnInit {
  isEdit = signal(false);
  saving = signal(false);
  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);

  private quoteId = '';

  form = this.fb.group({
    title: ['', Validators.required],
    customerId: ['', Validators.required],
    customerName: [''],
    opportunityId: [''],
    assignedRep: [''],
    validUntil: [''],
    currency: ['USD'],
    taxRate: [7.5],
    notes: [''],
    lineItems: this.fb.array([])
  });

  get lineItems(): FormArray { return this.form.get('lineItems') as FormArray; }

  subtotal = computed(() =>
    this.lineItems.controls.reduce((s, c) => s + (c.get('total')?.value ?? 0), 0)
  );

  discountTotal = computed(() => {
    let raw = 0;
    this.lineItems.controls.forEach(c => {
      const qty = c.get('quantity')?.value ?? 0;
      const price = c.get('unitPrice')?.value ?? 0;
      const disc = c.get('discount')?.value ?? 0;
      raw += qty * price * disc / 100;
    });
    return raw;
  });

  taxAmount = computed(() => this.subtotal() * (this.form.get('taxRate')?.value ?? 0) / 100);
  grandTotal = computed(() => this.subtotal() + this.taxAmount());

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private quoteSvc: QuoteService,
    private customerSvc: CustomerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.customerSvc.getCustomers().subscribe(c => this.customers.set(c));
    this.quoteSvc.getProducts().subscribe(p => this.products.set(p));

    this.quoteId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.quoteId && this.quoteId !== 'new') {
      this.isEdit.set(true);
      this.quoteSvc.getQuote(this.quoteId).subscribe(q => {
        this.form.patchValue(q);
        q.lineItems.forEach(li => this.lineItems.push(this.createLine(li)));
      });
    } else {
      this.addLine();
    }
  }

  private createLine(data?: Partial<{ productId: string; product: string; quantity: number; unitPrice: number; discount: number; total: number }>): ReturnType<FormBuilder['group']> {
    return this.fb.group({
      productId: [data?.productId ?? ''],
      product: [data?.product ?? ''],
      quantity: [data?.quantity ?? 1],
      unitPrice: [data?.unitPrice ?? 0],
      discount: [data?.discount ?? 0],
      total: [data?.total ?? 0]
    });
  }

  addLine(): void { this.lineItems.push(this.createLine()); }

  removeLine(i: number): void { this.lineItems.removeAt(i); }

  onCustomerChange(id: string): void {
    const c = this.customers().find(x => x.id === id);
    if (c) this.form.patchValue({ customerName: c.name });
  }

  onProductSelect(index: number, productId: string): void {
    if (productId === 'custom') return;
    const p = this.products().find(x => x.id === productId);
    if (p) {
      const ctrl = this.lineItems.at(index);
      ctrl.patchValue({ product: p.name, unitPrice: p.unitPrice });
      this.recalcLineTotal(index);
    }
  }

  recalcLineTotal(index: number): void {
    const ctrl = this.lineItems.at(index);
    const qty = ctrl.get('quantity')?.value ?? 0;
    const price = ctrl.get('unitPrice')?.value ?? 0;
    const disc = ctrl.get('discount')?.value ?? 0;
    const total = qty * price * (1 - disc / 100);
    ctrl.patchValue({ total }, { emitEvent: false });
  }

  recalculate(): void {
    this.lineItems.controls.forEach((_, i) => this.recalcLineTotal(i));
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const lineItems = this.lineItems.value;
    const subtotal = this.subtotal();
    const discount = this.discountTotal();
    const tax = this.taxAmount();
    const total = this.grandTotal();

    const payload = { ...this.form.value, lineItems, subtotal, discount, tax, total } as Partial<Quote>;

    const obs = this.isEdit()
      ? this.quoteSvc.updateQuote(this.quoteId, payload)
      : this.quoteSvc.createQuote(payload);

    obs.subscribe({
      next: (q) => {
        this.saving.set(false);
        this.snackBar.open(this.isEdit() ? 'Quote updated' : 'Quote created', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/quotes', q.id]);
      },
      error: () => { this.saving.set(false); this.snackBar.open('Error saving quote', 'Dismiss', { duration: 4000 }); }
    });
  }
}
