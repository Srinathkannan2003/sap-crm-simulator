import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Lead } from '../models';

@Injectable({ providedIn: 'root' })
export class LeadService extends ApiService {
  private endpoint = 'leads';

  getLeads(params?: Record<string, string>): Observable<Lead[]> {
    return this.getAll<Lead>(this.endpoint, params);
  }

  getLead(id: string): Observable<Lead> {
    return this.getById<Lead>(this.endpoint, id);
  }

  createLead(lead: Partial<Lead>): Observable<Lead> {
    const count = Math.floor(Math.random() * 900) + 100;
    return this.create<Lead>(this.endpoint, {
      ...lead,
      id: `LD-${count}`,
      createdDate: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      convertedOpportunityId: null
    });
  }

  updateLead(id: string, lead: Partial<Lead>): Observable<Lead> {
    return this.update<Lead>(this.endpoint, id, lead);
  }

  convertLead(id: string, opportunityId: string): Observable<Lead> {
    return this.patch<Lead>(this.endpoint, id, { status: 'Converted', convertedOpportunityId: opportunityId });
  }

  deleteLead(id: string): Observable<void> {
    return this.delete(this.endpoint, id);
  }
}
