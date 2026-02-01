import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="icon-container">
        <mat-icon class="warning-icon">warning</mat-icon>
      </div>
      <h2>{{ data.title }}</h2>
      <p>{{ data.message }}</p>
      <div class="actions">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="warn" (click)="onConfirm()">Delete</button>
      </div>
    </div>
  `,
  styles: [
    `
      .confirm-dialog {
        text-align: center;
        padding: 20px;
        min-width: 300px;
      }
      .icon-container {
        margin-bottom: 15px;
      }
      .warning-icon {
        font-size: 50px;
        width: 50px;
        height: 50px;
        color: #ff5252;
      }
      h2 {
        margin: 0 0 10px;
        color: #333;
        font-weight: 600;
      }
      p {
        color: #666;
        margin-bottom: 20px;
      }
      .actions {
        display: flex;
        justify-content: center;
        gap: 15px;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string },
  ) {}

  onCancel() {
    this.dialogRef.close(false);
  }

  onConfirm() {
    this.dialogRef.close(true);
  }
}
