import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, EntityType, Status, System, Team } from '../models/entities';

type EntityMap = {
  teams: Team;
  systems: System;
  clients: Client;
  statuses: Status;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = (import.meta as any).env?.NG_APP_API_URL ?? '/api';

  list<T extends EntityType>(type: T): Observable<EntityMap[T][]> {
    return this.http.get<EntityMap[T][]>(`${this.baseUrl}/${type}`);
  }

  create<T extends EntityType>(type: T, payload: EntityMap[T]): Observable<EntityMap[T]> {
    return this.http.post<EntityMap[T]>(`${this.baseUrl}/${type}`, payload);
  }

  update<T extends EntityType>(type: T, id: number, payload: Partial<EntityMap[T]>): Observable<EntityMap[T]> {
    return this.http.put<EntityMap[T]>(`${this.baseUrl}/${type}/${id}`, payload);
  }

  delete(type: EntityType, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${type}/${id}`);
  }
}
