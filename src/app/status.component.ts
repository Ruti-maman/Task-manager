import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="margin-top:1rem;border:1px dashed #ddd;padding:0.75rem;border-radius:6px;max-width:420px">
      <div><strong>Backend /health:</strong> <span *ngIf="status; else loading">{{status}}</span></div>
      <ng-template #loading><em>loading...</em></ng-template>
      <div style="margin-top:0.5rem"><strong>Saved token:</strong> <small>{{tokenPreview}}</small></div>
    </div>
  `,
})
export class StatusComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  status: string | null = null;
  tokenPreview = '';

  ngOnInit() {
    this.tokenPreview = this.auth.getToken() ? this.auth.getToken()!.slice(0, 24) + '...' : '(none)';
    this.http.get('http://127.0.0.1:3000/health').subscribe({
      next: (res: any) => (this.status = JSON.stringify(res)),
      error: (err) => (this.status = 'error: ' + (err?.message || err)),
    });
  }
}
