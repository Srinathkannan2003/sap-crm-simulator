import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

interface QuickLoginUser {
  label: string;
  username: string;
  password: string;
  role: string;
  color: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSelectModule, MatSnackBarModule
  ],
  template: `
    <div class="login-page">
      <!-- Background decoration -->
      <div class="login-bg">
        <div class="bg-shape bg-shape-1"></div>
        <div class="bg-shape bg-shape-2"></div>
        <div class="bg-shape bg-shape-3"></div>
      </div>

      <!-- Left panel - branding -->
      <div class="login-left">
        <div class="brand-section">
          <div class="sap-logo">
            <span class="logo-text">SAP</span>
          </div>
          <h1 class="product-title">CRM Sales<br>Simulator</h1>
          <p class="product-desc">A comprehensive simulation of SAP CRM sales processes — from lead capture to quote approval.</p>
        </div>

        <div class="feature-list">
          @for (f of features; track f.label) {
            <div class="feature-item">
              <mat-icon>{{ f.icon }}</mat-icon>
              <span>{{ f.label }}</span>
            </div>
          }
        </div>

        <div class="login-footer-brand">
          <span>Portfolio Project · Built with Angular 20 + SAP Fiori Design</span>
        </div>
      </div>

      <!-- Right panel - login form -->
      <div class="login-right">
        <div class="login-card">
          <div class="login-card-header">
            <div class="card-logo">
              <span>SAP</span>
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to your CRM account</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <input matInput formControlName="username" placeholder="Enter username" autocomplete="username">
              @if (loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched) {
                <mat-error>Username is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput
                     [type]="showPassword() ? 'text' : 'password'"
                     formControlName="password"
                     placeholder="Enter password"
                     autocomplete="current-password">
              <button mat-icon-button matSuffix type="button"
                      (click)="showPassword.set(!showPassword())">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            @if (errorMessage()) {
              <div class="login-error">
                <mat-icon>error</mat-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <button mat-flat-button color="primary"
                    type="submit"
                    class="login-btn"
                    [disabled]="isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
                Signing in...
              } @else {
                <mat-icon>login</mat-icon>
                Sign In
              }
            </button>
          </form>

          <!-- Quick Access -->
          <div class="quick-access">
            <div class="divider-label">Quick Demo Access</div>
            <div class="quick-btns">
              @for (u of quickUsers; track u.username) {
                <button class="quick-btn" [style.--btn-color]="u.color"
                        (click)="quickLogin(u)">
                  <span class="qb-role">{{ u.role }}</span>
                  <span class="qb-user">{{ u.username }}</span>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      position: relative;
      overflow: hidden;
    }

    .login-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
      background: var(--sap-shell-dark);
    }

    .bg-shape {
      position: absolute;
      border-radius: 50%;
      opacity: .06;
    }

    .bg-shape-1 {
      width: 600px; height: 600px;
      background: var(--sap-blue);
      top: -200px; left: -100px;
    }

    .bg-shape-2 {
      width: 400px; height: 400px;
      background: white;
      bottom: -150px; left: 20%;
    }

    .bg-shape-3 {
      width: 300px; height: 300px;
      background: var(--sap-gold);
      top: 30%; right: 35%;
    }

    .login-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 3rem 3.5rem;
      position: relative;
      z-index: 1;

      @media (max-width: 900px) { display: none; }
    }

    .sap-logo {
      width: 56px; height: 56px;
      background: var(--sap-blue);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .logo-text {
      color: white;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: .05em;
    }

    .product-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      line-height: 1.15;
      margin: 0 0 1rem;
    }

    .product-desc {
      font-size: 1rem;
      color: rgba(255,255,255,.6);
      line-height: 1.6;
      max-width: 420px;
      margin: 0 0 2.5rem;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: .875rem;
      margin-bottom: auto;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: .75rem;
      color: rgba(255,255,255,.75);
      font-size: .929rem;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--sap-blue);
        flex-shrink: 0;
      }
    }

    .login-footer-brand {
      margin-top: 2.5rem;
      font-size: .786rem;
      color: rgba(255,255,255,.3);
    }

    .login-right {
      width: 480px;
      flex-shrink: 0;
      background: #f0f2f5;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      z-index: 1;

      @media (max-width: 900px) {
        width: 100%;
        background: var(--sap-shell-dark);
        align-items: flex-start;
        padding-top: 4rem;
      }
    }

    .login-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 400px;
    }

    .login-card-header {
      text-align: center;
      margin-bottom: 2rem;

      .card-logo {
        width: 44px; height: 44px;
        background: var(--sap-blue);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;

        span {
          color: white;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .05em;
        }
      }

      h2 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: .25rem;
      }

      p {
        color: var(--text-secondary);
        font-size: .875rem;
        margin: 0;
      }
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: .25rem;

      .full-width { width: 100%; }
    }

    .login-error {
      display: flex;
      align-items: center;
      gap: .5rem;
      padding: .75rem 1rem;
      background: var(--sap-red-light);
      border-radius: var(--radius-sm);
      color: var(--sap-red);
      font-size: .857rem;

      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .login-btn {
      height: 44px;
      font-size: 1rem !important;
      font-weight: 600 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .5rem;
      margin-top: .5rem;
    }

    .btn-spinner {
      display: inline-block;
    }

    .quick-access {
      margin-top: 1.75rem;
    }

    .divider-label {
      display: flex;
      align-items: center;
      gap: .75rem;
      font-size: .75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: .06em;
      font-weight: 600;
      margin-bottom: .875rem;

      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--border-color);
      }
    }

    .quick-btns {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: .5rem;
    }

    .quick-btn {
      border: 2px solid var(--border-color);
      border-radius: 8px;
      padding: .625rem .75rem;
      background: white;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      transition: all 140ms ease;

      &:hover {
        border-color: var(--btn-color, var(--sap-blue));
        background: color-mix(in srgb, var(--btn-color, var(--sap-blue)) 6%, white);
      }

      .qb-role {
        font-size: .643rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .05em;
        color: var(--btn-color, var(--sap-blue));
      }

      .qb-user {
        font-size: .75rem;
        color: var(--text-primary);
        font-weight: 500;
      }
    }
  `]
})
export class LoginComponent {
  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly features = [
    { icon: 'people', label: 'Business Partner & Customer Management' },
    { icon: 'track_changes', label: 'Lead Capture & Qualification' },
    { icon: 'trending_up', label: 'Opportunity Pipeline Management' },
    { icon: 'event', label: 'Activity Scheduling & Tracking' },
    { icon: 'request_quote', label: 'Quote Creation & Approval Workflow' },
    { icon: 'bar_chart', label: 'Reports & Revenue Analytics' },
  ];

  readonly quickUsers: QuickLoginUser[] = [
    { label: 'Manager', username: 'manager', password: 'manager123', role: 'Manager', color: '#0a6ed1' },
    { label: 'Rep 1', username: 'rep1', password: 'rep123', role: 'Sales Rep', color: '#107e3e' },
    { label: 'Rep 2', username: 'rep2', password: 'rep123', role: 'Sales Rep', color: '#e8a000' },
  ];

  readonly loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.doLogin(
      this.loginForm.value.username!,
      this.loginForm.value.password!
    );
  }

  quickLogin(user: QuickLoginUser): void {
    this.doLogin(user.username, user.password);
  }

  private doLogin(username: string, password: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(username, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Invalid username or password. Please try again.');
      }
    });
  }
}
