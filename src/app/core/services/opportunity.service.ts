import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Opportunity } from '../models';

@Injectable({ providedIn: 'root' })
export class OpportunityService extends ApiService {
  private endpoint = 'opportunities';

  getOpportunities(params?: Record<string, string>): Observable<Opportunity[]> {
    return this.getAll<Opportunity>(this.endpoint, params);
  }

  getOpportunity(id: string): Observable<Opportunity> {
    return this.getById<Opportunity>(this.endpoint, id);
  }

  createOpportunity(opp: Partial<Opportunity>): Observable<Opportunity> {
    const count = Math.floor(Math.random() * 900) + 100;
    return this.create<Opportunity>(this.endpoint, {
      ...opp,
      id: `OPP-${count}`,
      createdDate: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0]
    });
  }

  updateOpportunity(id: string, opp: Partial<Opportunity>): Observable<Opportunity> {
    return this.update<Opportunity>(this.endpoint, id, opp);
  }

  deleteOpportunity(id: string): Observable<void> {
    return this.delete(this.endpoint, id);
  }
}
