import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { apiUrl } from '../../config';
import { AddProjectDialogComponent } from './add-project-dialog/add-project-dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  projects: any[] = [];
  teamId: string = '';
  teamName: string = '';
  userName: string = 'User';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.teamId = this.route.snapshot.paramMap.get('teamId') || '';
    this.loadProjects();
    this.loadTeamName();
    this.loadUserName();
  }

  loadUserName() {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.userName = user.name || user.email?.split('@')[0] || 'User';
    }
  }

  loadTeamName() {
    if (this.teamId) {
      this.http.get<any>(`${apiUrl}/teams`).subscribe({
        next: (teams) => {
          const team = teams.find((t: any) => t.id == this.teamId);
          if (team) {
            this.teamName = team.name;
            this.cdr.detectChanges();
          }
        },
      });
    }
  }

  loadProjects() {
    this.http.get<any[]>(`${apiUrl}/projects`).subscribe({
      next: (data) => {
        // Filter projects by team
        if (this.teamId) {
          this.projects = data.filter((p) => p.team_id == this.teamId || p.teamId == this.teamId);
        } else {
          this.projects = data;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching projects:', err),
    });
  }

  openAddProjectDialog() {
    const dialogRef = this.dialog.open(AddProjectDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newProject = { ...result, teamId: this.teamId };

        this.http.post<any>(`${apiUrl}/projects`, newProject).subscribe({
          next: (createdProject) => {
            // Add immediately to the list
            this.projects = [...this.projects, createdProject];
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Failed to create project', err),
        });
      }
    });
  }

  deleteProject(projectId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete Project',
        message: 'Are you sure you want to delete this project?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.http.delete(`${apiUrl}/projects/${projectId}`).subscribe({
          next: () => {
            this.projects = this.projects.filter((p) => p.id !== projectId);
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error deleting project:', err),
        });
      }
    });
  }
}
