import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  serverErrorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    this.serverErrorMessage = null; // Clear old errors

    if (this.registerForm.valid) {
      this.isLoading = true;
      const { username, email, password } = this.registerForm.value;

      this.authService.register(username, email, password).subscribe({
        next: () => {
          this.serverErrorMessage = 'Registration successful!', 'Close', { duration: 3000 };
          this.router.navigate(['/Home']);
        },
        error: (error) => {
          // Safely extract error message
          this.serverErrorMessage = error?.error?.message || 'რეგისტრაცია ვერ შესრულდა';
          this.isLoading = false;
        }
      });
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
} 