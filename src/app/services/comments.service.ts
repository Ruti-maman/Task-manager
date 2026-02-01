import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../config';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private commentsUrl = `${apiUrl}/comments`;

  constructor(private http: HttpClient) { }

  getComments(taskId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.commentsUrl}?taskId=${taskId}`);
  }

  addComment(taskId: number, body: string): Observable<any> {
    return this.http.post<any>(this.commentsUrl, { taskId, body });
  }
}
