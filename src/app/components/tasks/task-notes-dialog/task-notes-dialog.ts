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
          <div class="header-icon">
            <mat-icon>edit_note</mat-icon>
          </div>
          <div class="header-text">
            <h2>Task Notes</h2>
            <span class="task-name">{{ data.taskTitle }}</span>
          </div>
        </div>
        <button class="close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-body">
        <div class="notes-list">
          @if (comments.length === 0) {
            <div class="empty-notes">
              <div class="empty-icon">
                <mat-icon>speaker_notes_off</mat-icon>
              </div>
              <h3>No notes yet</h3>
              <p>Start the conversation by adding your first note!</p>
            </div>
          }
          @for (comment of comments; track comment.id) {
            <div class="note-item">
              <div class="note-avatar">
                <mat-icon>person</mat-icon>
              </div>
              <div class="note-bubble">
                <div class="note-content">{{ comment.body }}</div>
                <div class="note-meta">
                  <span class="note-author">{{ comment.author_name || 'You' }}</span>
                  <span class="note-dot">•</span>
                  <span class="note-date">{{ formatDate(comment.created_at) }}</span>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="add-note-section">
          <div class="input-wrapper">
            <input 
              type="text" 
              [(ngModel)]="newNote" 
              placeholder="Write a note..." 
              class="note-text-input"
              (keyup.enter)="addNote()"
            />
            <button class="send-btn" (click)="addNote()" [disabled]="!newNote.trim()">
              <mat-icon>send</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notes-dialog {
      padding: 0;
      display: flex;
      flex-direction: column;
      min-width: 400px;
      max-width: 500px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin: -24px -24px 0;
      border-radius: 4px 4px 0 0;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .header-text h2 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 700;
    }

    .task-name {
      font-size: 0.85rem;
      opacity: 0.9;
    }

    .close-btn {
      background: rgba(255,255,255,0.15);
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
      background: rgba(255,255,255,0.25);
      transform: rotate(90deg);
    }

    .dialog-body {
      padding: 20px 24px;
      background: #f8f9fc;
      margin: 0 -24px -24px;
      border-radius: 0 0 4px 4px;
    }

    .notes-list {
      min-height: 120px;
      max-height: 280px;
      overflow-y: auto;
      margin-bottom: 20px;
    }

    .empty-notes {
      text-align: center;
      padding: 40px 20px;
    }

    .empty-icon {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #e0e5ec 0%, #d0d5dc 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 15px;
    }

    .empty-icon mat-icon {
      font-size: 35px;
      width: 35px;
      height: 35px;
      color: #a0a5b0;
    }

    .empty-notes h3 {
      margin: 0 0 8px;
      color: #555;
      font-weight: 600;
    }

    .empty-notes p {
      margin: 0;
      color: #999;
      font-size: 0.9rem;
    }

    .note-item {
      display: flex;
      gap: 12px;
      margin-bottom: 15px;
    }

    .note-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .note-avatar mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: white;
    }

    .note-bubble {
      flex: 1;
      background: white;
      padding: 12px 16px;
      border-radius: 0 16px 16px 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .note-content {
      font-size: 0.95rem;
      color: #333;
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .note-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: #999;
    }

    .note-author {
      font-weight: 600;
      color: #667eea;
    }

    .note-dot {
      font-size: 8px;
    }

    .add-note-section {
      padding-top: 15px;
      border-top: 1px solid #e5e8f0;
    }

    .input-wrapper {
      display: flex;
      gap: 10px;
      align-items: center;
      background: white;
      border-radius: 30px;
      padding: 6px 6px 6px 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }

    .note-text-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 0.95rem;
      color: #333;
      background: transparent;
    }

    .note-text-input::placeholder {
      color: #aaa;
    }

    .send-btn {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }

    .send-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .send-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
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
