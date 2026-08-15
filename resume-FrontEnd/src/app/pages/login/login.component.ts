import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)])
  });

  isLoading = false;
  errorMessage = '';
  showPassword = false;

  // Forgot Password Modal State
  isForgotModalOpen = false;
  forgotStep: 'email' | 'otp' = 'email';
  forgotEmail = '';
  enteredOtp = '';
  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  forgotLoading = false;
  forgotSuccessMessage = '';
  forgotErrorMessage = '';
  devOtpCode = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.value.email?.trim() ?? '';
    const password = this.loginForm.value.password ?? '';

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(email, password)
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
          
          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        },

        error: (error) => {
          this.isLoading = false;
          console.error('Login failed:', error);
          this.errorMessage = error?.error?.message || 'Invalid email or password. Please try again.';
        }
      });
  }

  openForgotModal(): void {
    this.forgotEmail = this.loginForm.value.email || '';
    this.forgotStep = 'email';
    this.enteredOtp = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.devOtpCode = '';
    this.forgotSuccessMessage = '';
    this.forgotErrorMessage = '';
    this.isForgotModalOpen = true;
  }

  closeForgotModal(): void {
    this.isForgotModalOpen = false;
    this.forgotSuccessMessage = '';
    this.forgotErrorMessage = '';
  }

  sendForgotPassword(): void {
    if (!this.forgotEmail || !this.forgotEmail.includes('@')) {
      this.forgotErrorMessage = 'Please enter a valid email address.';
      return;
    }

    this.forgotLoading = true;
    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';

    this.authService.forgotPassword(this.forgotEmail.trim()).subscribe({
      next: (res) => {
        this.forgotLoading = false;
        this.enteredOtp = '';
        this.newPassword = '';
        this.confirmPassword = '';
        if (res?.devOtp) {
          this.devOtpCode = String(res.devOtp);
        }
        this.forgotStep = 'otp';
      },
      error: (err) => {
        this.forgotLoading = false;
        this.forgotErrorMessage = err?.error?.message || 'No account found with this email address.';
      }
    });
  }

  verifyOtpAndReset(): void {
    this.forgotErrorMessage = '';

    if (!this.enteredOtp || this.enteredOtp.trim().length < 4) {
      this.forgotErrorMessage = 'Please enter the 6-digit OTP code sent to your email.';
      return;
    }

    if (!this.newPassword || this.newPassword.length < 4) {
      this.forgotErrorMessage = 'Password must be at least 4 characters long.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.forgotErrorMessage = 'New passwords do not match.';
      return;
    }

    this.forgotLoading = true;

    // Call Backend API to reset password in database
    this.authService.resetPassword({
      email: this.forgotEmail.trim(),
      otp: this.enteredOtp.trim(),
      newPassword: this.newPassword
    }).subscribe({
      next: (res) => {
        this.forgotLoading = false;
        this.loginForm.patchValue({
          email: this.forgotEmail,
          password: this.newPassword
        });
        this.forgotSuccessMessage = res?.message || 'Password updated successfully in database! Your credentials have been prefilled. Click "Continue to Sign In".';
      },
      error: (err) => {
        this.forgotLoading = false;
        this.forgotErrorMessage = err?.error?.message || 'Failed to reset password. Please verify your OTP or check backend email configuration.';
      }
    });
  }
}