import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  form = new FormGroup({
    current: new FormControl('', Validators.required),
    next: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirm: new FormControl('', Validators.required),
  });
  message = '';
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.form.value.next !== this.form.value.confirm) {
      this.message = 'New passwords do not match.';
      return;
    }
    this.message =
      'Password change is not connected to an API endpoint in the current Angular project.';
  }
}
