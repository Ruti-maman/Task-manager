import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../../config'; // הייבוא מהקונפיג שלך

@Component({
  selector: 'app-create-project-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './create-project-dialog.html',
  styleUrls: ['./create-project-dialog.css']
})
export class CreateProjectDialogComponent implements OnInit {
  projectName: string = '';
  projectDescription: string = ''; 
  selectedTeamId: any = null;
  teams: any[] = [];

  constructor(
    private http: HttpClient, 
    private dialogRef: MatDialogRef<CreateProjectDialogComponent>
  ) {}

  ngOnInit() {
    // טעינת הצוותים מהשרת כדי שיופיעו ברשימת הבחירה
    this.http.get<any[]>(`${apiUrl}/teams`).subscribe({
      next: (res) => {
        this.teams = res;
        console.log('הצוותים נטענו:', res);
      },
      error: (err) => console.error('שגיאה בטעינת צוותים:', err)
    });
  }

  create() {
    // בניית האובייקט לשליחה לשרת
    const payload = { 
      name: this.projectName, 
      description: this.projectDescription,
      teamId: Number(this.selectedTeamId) // הפיכה למספר מונעת שגיאות הרשאה
    };

    this.http.post(`${apiUrl}/projects`, payload).subscribe({
      next: () => {
        console.log('הפרויקט נוצר בהצלחה!');
        this.dialogRef.close(true);
      },
      error: (err) => console.error('שגיאה ביצירת פרויקט:', err)
    });
  }

  close() {
    this.dialogRef.close();
  }
}