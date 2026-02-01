import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../config';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private apiUrl = `${apiUrl}/teams`;

  constructor(private http: HttpClient) { }

  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createTeam(teamData: { name: string, description: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, teamData);
  }
  deleteTeam(id: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/${id}`);
}
 
}