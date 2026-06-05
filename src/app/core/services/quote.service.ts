import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Quote, Product } from '../models';

@Injectable({ providedIn: 'root' })
export class QuoteService extends ApiService {
  private endpoint = 'quotes';

  getQuotes(params?: Record<string, string>): Observable<Quote[]> {
    return this.getAll<Quote>(this.endpoint, params);
  }

  getQuote(id: string): Observable<Quote> {
    return this.getById<Quote>(this.endpoint, id);
  }

  getProducts(): Observable<Product[]> {
    return this.getAll<Product>('products');
  }

  createQuote(quote: Partial<Quote>): Observable<Quote> {
    const count = Math.floor(Math.random() * 900) + 100;
    return this.create<Quote>(this.endpoint, {
      ...quote,
      id: `QT-${count}`,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Draft'
    });
  }

  updateQuote(id: string, quote: Partial<Quote>): Observable<Quote> {
    return this.update<Quote>(this.endpoint, id, quote);
  }

  submitQuote(id: string): Observable<Quote> {
    return this.patch<Quote>(this.endpoint, id, { status: 'Submitted' });
  }

  approveQuote(id: string, approvedBy: string): Observable<Quote> {
    return this.patch<Quote>(this.endpoint, id, { status: 'Approved', approvedBy });
  }

  rejectQuote(id: string): Observable<Quote> {
    return this.patch<Quote>(this.endpoint, id, { status: 'Rejected' });
  }

  deleteQuote(id: string): Observable<void> {
    return this.delete(this.endpoint, id);
  }
}
