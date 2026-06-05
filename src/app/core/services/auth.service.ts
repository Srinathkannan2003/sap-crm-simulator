import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { User, AuthState } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'sap_crm_auth';

  private _authState = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null
  });

  readonly authState = this._authState.asReadonly();
  readonly currentUser = computed(() => this._authState().user);
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
  readonly isManager = computed(() => this._authState().user?.role === 'Sales Manager');

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  login(username: string, password: string): Observable<User> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`, {
      params: { username, password }
    }).pipe(
      map(users => {
        if (!users || users.length === 0) {
          throw new Error('Invalid credentials');
        }
        return users[0];
      }),
      tap(user => {
        const token = btoa(`${user.id}:${Date.now()}`);
        const state: AuthState = { user, isAuthenticated: true, token };
        this._authState.set(state);
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    this._authState.set({ user: null, isAuthenticated: false, token: null });
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/auth/login']);
  }

  private restoreSession(): void {
    const stored = sessionStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const state = JSON.parse(stored) as AuthState;
        this._authState.set(state);
      } catch {
        sessionStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }
}
