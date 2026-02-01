import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-team-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './add-team-dialog.html',
  styleUrls: ['./add-team-dialog.css']
})
export class AddTeamDialogComponent {
  teamForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddTeamDialogComponent>
  ) {
    this.teamForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.teamForm.valid) {
      this.dialogRef.close(this.teamForm.value);
    }
  }
}
