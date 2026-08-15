import { Component } from '@angular/core';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  user: any = {};
  constructor() {
    const raw = localStorage.getItem('userName');
    if (raw) {
      try {
        this.user = JSON.parse(raw);
      } catch {}
    }
  }
}
