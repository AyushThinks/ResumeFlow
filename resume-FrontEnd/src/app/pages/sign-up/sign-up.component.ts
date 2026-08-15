import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  signupForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  signup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const name = this.signupForm.value.name?.trim() ?? '';
    const email = this.signupForm.value.email?.trim() ?? '';
    const password = this.signupForm.value.password ?? '';

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(name, email, password)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          // Store token
          localStorage.setItem('token', response.data.token);
          // User metadata
          localStorage.setItem(
            'userName',
            JSON.stringify(response.data.user)
          );
          // Go directly to dashboard
          this.router.navigate(['/dashboard']);
        },

        error: (error) => {
          this.isLoading = false;
          console.error('Signup failed:', error);
          this.errorMessage = error?.error?.message || 'Unable to create account. Please check your details and try again.';
        }
      });
  }
}