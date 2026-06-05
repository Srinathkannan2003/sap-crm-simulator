import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Activity } from '../models';

@Injectable({ providedIn: 'root' })
export class ActivityService extends ApiService {
  private endpoint = 'activities';

  getActivities(params?: Record<string, string>): Observable<Activity[]> {
    return this.getAll<Activity>(this.endpoint, params);
  }

  getActivity(id: string): Observable<Activity> {
    return this.getById<Activity>(this.endpoint, id);
  }

  createActivity(activity: Partial<Activity>): Observable<Activity> {
    const count = Math.floor(Math.random() * 900) + 100;
    return this.create<Activity>(this.endpoint, {
      ...activity,
      id: `ACT-${count}`,
      completedDate: null,
      outcome: null
    });
  }

  updateActivity(id: string, activity: Partial<Activity>): Observable<Activity> {
    return this.update<Activity>(this.endpoint, id, activity);
  }

  completeActivity(id: string, outcome: string): Observable<Activity> {
    return this.patch<Activity>(this.endpoint, id, {
      status: 'Completed',
      completedDate: new Date().toISOString().split('T')[0],
      outcome
    });
  }

  deleteActivity(id: string): Observable<void> {
    return this.delete(this.endpoint, id);
  }
}
