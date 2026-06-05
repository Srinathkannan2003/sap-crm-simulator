import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Customer } from '../models';

@Injectable({ providedIn: 'root' })
export class CustomerService extends ApiService {
  private endpoint = 'customers';

  getCustomers(search?: string): Observable<Customer[]> {
    const params: Record<string, string> = {};
    if (search) params['q'] = search;
    return this.getAll<Customer>(this.endpoint, params);
  }

  getCustomer(id: string): Observable<Customer> {
    return this.getById<Customer>(this.endpoint, id);
  }

  createCustomer(customer: Partial<Customer>): Observable<Customer> {
    const id = `BP-${String(Date.now()).slice(-3).padStart(3, '0')}`;
    return this.create<Customer>(this.endpoint, { ...customer, id, createdDate: new Date().toISOString().split('T')[0] });
  }

  updateCustomer(id: string, customer: Partial<Customer>): Observable<Customer> {
    return this.update<Customer>(this.endpoint, id, customer);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.delete(this.endpoint, id);
  }
}
