import { Component, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatIconModule,
    MatButtonModule, MatMenuModule, MatTooltipModule,
    MatBadgeModule, MatDividerModule, AsyncPipe
  ],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav
        #sidenav
        [mode]="isHandset() ? 'over' : 'side'"
        [opened]="!isHandset()"
        class="shell-sidenav">

        <!-- Logo / Brand -->
        <div class="nav-brand">
          <div class="brand-logo">
            <span class="logo-sap">SAP</span>
          </div>
          <div class="brand-text">
            <span class="brand-title">CRM Sales</span>
            <span class="brand-subtitle">Simulator</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="nav-menu">
          <div class="nav-section-label">Main Menu</div>
          @for (item of navItems; track item.route) {
            <a class="nav-item"
               [routerLink]="item.route"
               routerLinkActive="active"
               [matTooltip]="item.label"
               matTooltipPosition="right">
              <mat-icon>{{ item.icon }}</mat-icon>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <!-- User profile at bottom -->
        <div class="nav-footer">
          <div class="nav-user">
            <div class="user-avatar">{{ currentUser()?.avatar }}</div>
            <div class="user-info">
              <span class="user-name">{{ currentUser()?.name }}</span>
              <span class="user-role">{{ currentUser()?.role }}</span>
            </div>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="shell-content">
        <!-- Top Header -->
        <header class="shell-header">
          <button mat-icon-button (click)="sidenav.toggle()" class="menu-btn">
            <mat-icon>menu</mat-icon>
          </button>

          <div class="header-breadcrumb">
            <span class="header-app">SAP CRM Sales Simulator</span>
          </div>

          <div class="header-actions">
            <button mat-icon-button matTooltip="Notifications">
              <mat-icon [matBadge]="'3'" matBadgeColor="warn" matBadgeSize="small">notifications</mat-icon>
            </button>

            <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-btn">
              <div class="header-avatar">{{ currentUser()?.avatar }}</div>
            </button>

            <mat-menu #userMenu="matMenu" xPosition="before">
              <div class="user-menu-header">
                <strong>{{ currentUser()?.name }}</strong>
                <span>{{ currentUser()?.role }}</span>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item>
                <mat-icon>person</mat-icon> Profile
              </button>
              <button mat-menu-item>
                <mat-icon>settings</mat-icon> Settings
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon color="warn">logout</mat-icon>
                <span style="color: var(--sap-red)">Sign Out</span>
              </button>
            </mat-menu>
          </div>
        </header>

        <!-- Page Content -->
        <main class="shell-main">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell-container {
      height: 100vh;
      background: var(--bg-primary);
    }

    .shell-sidenav {
      width: var(--nav-width);
      background: var(--sap-shell);
      border: none;
      display: flex;
      flex-direction: column;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: .875rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,.1);
      height: var(--header-height);
      flex-shrink: 0;
    }

    .brand-logo {
      width: 36px;
      height: 36px;
      background: var(--sap-blue);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-sap {
      color: white;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .05em;
    }

    .brand-title {
      display: block;
      color: white;
      font-size: .929rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .brand-subtitle {
      display: block;
      color: rgba(255,255,255,.5);
      font-size: .75rem;
      line-height: 1;
    }

    .nav-menu {
      flex: 1;
      padding: 1rem .75rem;
      overflow-y: auto;
    }

    .nav-section-label {
      font-size: .643rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .1em;
      color: rgba(255,255,255,.35);
      padding: 0 .75rem .5rem;
      margin-bottom: .25rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: .875rem;
      padding: .625rem .875rem;
      border-radius: 6px;
      color: rgba(255,255,255,.75);
      text-decoration: none;
      font-size: .875rem;
      font-weight: 500;
      margin-bottom: 2px;
      transition: all var(--transition);

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        opacity: .85;
      }

      &:hover {
        background: rgba(255,255,255,.1);
        color: white;
        text-decoration: none;
      }

      &.active {
        background: var(--sap-blue);
        color: white;

        mat-icon { opacity: 1; }
      }
    }

    .nav-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255,255,255,.1);
      flex-shrink: 0;
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: .75rem;
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--sap-blue);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .786rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .user-name {
      display: block;
      color: white;
      font-size: .857rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .user-role {
      display: block;
      color: rgba(255,255,255,.5);
      font-size: .75rem;
      line-height: 1;
    }

    .shell-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .shell-header {
      height: var(--header-height);
      background: var(--bg-white);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      padding: 0 1.25rem;
      gap: 1rem;
      flex-shrink: 0;
      box-shadow: var(--shadow-xs);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .menu-btn { color: var(--text-secondary); }

    .header-breadcrumb {
      flex: 1;
    }

    .header-app {
      font-size: .857rem;
      font-weight: 600;
      color: var(--sap-shell);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: .25rem;
    }

    .header-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--sap-blue);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .714rem;
      font-weight: 700;
    }

    .user-menu-header {
      padding: .75rem 1rem;
      display: flex;
      flex-direction: column;

      strong { font-size: .929rem; }
      span { font-size: .786rem; color: var(--text-secondary); }
    }

    .shell-main {
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class ShellComponent {
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Business Partners', icon: 'people', route: '/customers' },
    { label: 'Lead Management', icon: 'track_changes', route: '/leads' },
    { label: 'Opportunities', icon: 'trending_up', route: '/opportunities' },
    { label: 'Activities', icon: 'event', route: '/activities' },
    { label: 'Quotes', icon: 'request_quote', route: '/quotes' },
    { label: 'Reports', icon: 'bar_chart', route: '/reports' },
  ];

  readonly currentUser = this.authService.currentUser;
  readonly isHandset = signal(false);

  constructor(
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(map(r => r.matches))
      .subscribe(matches => this.isHandset.set(matches));
  }

  logout(): void {
    this.authService.logout();
  }
}
