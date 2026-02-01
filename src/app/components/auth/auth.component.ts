import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// --- הוספנו את אלה בשביל העיצוב החדש ---
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
// ---------------------------------------

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // --- וגם כאן הוספנו אותם ---
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    // ---------------------------
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
  authForm: FormGroup;
  isLoginMode = true;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: [''],
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = null;
    if (!this.isLoginMode) {
      this.authForm.get('name')?.setValidators([Validators.required]);
    } else {
      this.authForm.get('name')?.clearValidators();
    }
    this.authForm.get('name')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.authForm.invalid) {
      return;
    }

    const { email, password, name } = this.authForm.value;
    let authObs;

    if (this.isLoginMode) {
      authObs = this.authService.login({ email, password });
    } else {
      authObs = this.authService.register({ name, email, password });
    }

    authObs.subscribe({
      next: (res: any) => {
        console.log('Success!', res);

        // Token is already saved by AuthService via tap()
        // No need to save it again here

        // --- הנה השינוי החשוב: ---
        // במקום לנווט ל-teams, אנחנו מנווטים ל-dashboard
        this.router.navigate(['/dashboard']);
        // ------------------------
      },
      error: (err) => {
        // ... (קוד טיפול בשגיאות נשאר אותו דבר)
      },
    });
  }
}
