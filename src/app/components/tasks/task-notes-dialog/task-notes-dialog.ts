import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommentsService } from '../../../services/comments.service';

@Component({
  selector: 'app-task-notes-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <div class="notes-dialog">
      <div class="dialog-header">
        <div class="header-info">
          <mat-icon>sticky_note_2</mat-icon>
          <h2>Notes for: {{ data.taskTitle }}</h2>
        </div>
        <button class="close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="notes-list">
        @if (comments.length === 0) {
          <div class="empty-notes">
            <mat-icon>note_add</mat-icon>
            <p>No notes yet. Add your first note below!</p>
          </div>
        }
        @for (comment of comments; track comment.id) {
          <div class="note-item">
            <div class="note-content">{{ comment.body }}</div>
            <div class="note-meta">
              <span class="note-author">{{ comment.author_name || 'You' }}</span>
              <span class="note-date">{{ formatDate(comment.created_at) }}</span>
            </div>
          </div>
        }
      </div>

      <div class="add-note-section">
        <mat-form-field appearance="outline" class="note-input">
          <mat-label>Write a note...</mat-label>
          <textarea matInput [(ngModel)]="newNote" rows="2" placeholder="Add your note here..."></textarea>
        </mat-form-field>
        <button class="add-note-btn" (click)="addNote()" [disabled]="!newNote.trim()">
          <mat-icon>send</mat-icon>
          Add Note
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notes-dialog {
      padding: 0;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: linear-gradient(135deg, #4caf50 0%, #43a047 100%);
      color: white;
      margin: -24px -24px 0;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-info mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .header-info h2 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }

    .close-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .notes-list {
      flex: 1;
      overflow-y: auto;
      padding: 20px 0;
      max-height: 300px;
      min-height: 150px;
    }

    .empty-notes {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    .empty-notes mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ddd;
    }

    .empty-notes p {
      margin: 15px 0 0;
    }

    .note-item {
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
      margin-bottom: 12px;
      border-left: 4px solid #4caf50;
    }

    .note-content {
      font-size: 0.95rem;
      color: #333;
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .note-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #888;
    }

    .note-author {
      font-weight: 600;
      color: #4caf50;
    }

    .add-note-section {
      padding-top: 15px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .note-input {
      flex: 1;
    }

    .note-input ::ng-deep .mat-mdc-form-field-flex {
      background: #f8f9fa;
    }

    .add-note-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #4caf50 0%, #43a047 100%);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 8px;
    }

    .add-note-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
    }

    .add-note-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .add-note-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class TaskNotesDialogComponent implements OnInit {
  comments: any[] = [];
  newNote: string = '';

  constructor(
    public dialogRef: MatDialogRef<TaskNotesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { taskId: number; taskTitle: string },
    private commentsService: CommentsService
  ) {}

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    this.commentsService.getComments(this.data.taskId).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (err) => console.error('Error loading comments:', err)
    });
  }

  addNote() {
    if (!this.newNote.trim()) return;

    this.commentsService.addComment(this.data.taskId, this.newNote.trim()).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.newNote = '';
      },
      error: (err) => console.error('Error adding comment:', err)
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  close() {
    this.dialogRef.close();
  }
}
