import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../config';

@Injectable({
  providedIn: 'root',
})
export class TeamsService {
 

  constructor(private http: HttpClient) {}

  // פונקציה להבאת כל הצוותים
  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${apiUrl}/teams`);
  }

  // פונקציה ליצירת צוות חדש
  createTeam(teamData: { name: string; description: string }): Observable<any> {
    return this.http.post<any>(`${apiUrl}/teams`, teamData);
  }
  deleteTeam(id: number): Observable<any> {
    return this.http.delete<any>(`${apiUrl}/teams/${id}`);
  }
}
