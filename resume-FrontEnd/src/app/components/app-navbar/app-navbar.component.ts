import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-app-navbar',
  templateUrl: './app-navbar.component.html',
  styleUrls: ['./app-navbar.component.scss']
})
export class AppNavbarComponent implements OnInit {

  isMenuOpen = false;

  user: User | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const storedUser = localStorage.getItem('userName');

    if (!storedUser) {
      return;
    }

    try {
      this.user = JSON.parse(storedUser) as User;
    } catch (error) {
      console.error('Failed to load user:', error);
      this.user = null;
    }
  }

  get userInitials(): string {
    if (!this.user?.name) {
      return 'U';
    }

    const nameParts = this.user.name.trim().split(/\s+/);

    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }

    return (
      nameParts[0].charAt(0) +
      nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('rf_exports');

    this.closeMenu();

    this.router.navigate(['/login']);
  }
}