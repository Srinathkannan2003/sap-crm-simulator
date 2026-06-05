import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected baseUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  getAll<T>(endpoint: string, params?: Record<string, string>): Observable<T[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get<T[]>(`${this.baseUrl}/${endpoint}`, { params: httpParams });
  }

  getById<T>(endpoint: string, id: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  create<T>(endpoint: string, data: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  update<T>(endpoint: string, id: string, data: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}/${id}`, data);
  }

  patch<T>(endpoint: string, id: string, data: Partial<T>): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}/${id}`, data);
  }

  delete(endpoint: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${endpoint}/${id}`);
  }
}
