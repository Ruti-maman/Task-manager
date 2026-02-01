import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { apiUrl } from '../../config';
import { AddTeamDialogComponent } from './add-team-dialog/add-team-dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatDialogModule],
  templateUrl: './teams.html',
  styleUrls: ['./teams.css']
})
export class Teams implements OnInit {
  teams: any[] = [];

  constructor(
    private http: HttpClient, 
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.http.get<any[]>(`${apiUrl}/teams`).subscribe({
      next: (res) => {
        this.teams = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading teams', err)
    });
  }

  openCreateTeamDialog() {
    const dialogRef = this.dialog.open(AddTeamDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post<any>(`${apiUrl}/teams`, { 
          name: result.name, 
          description: result.description 
        }).subscribe({
          next: (newTeam) => {
            // Add the new team directly to the array
            this.teams = [...this.teams, newTeam];
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error creating team:', err)
        });
      }
    });
  }

  deleteTeam(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { 
        title: 'Delete Team', 
        message: 'Are you sure you want to delete this team?' 
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.http.delete(`${apiUrl}/teams/${id}`).subscribe({
          next: () => {
            this.teams = this.teams.filter(t => t.id !== id);
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error deleting team:', err)
        });
      }
    });
  }
}