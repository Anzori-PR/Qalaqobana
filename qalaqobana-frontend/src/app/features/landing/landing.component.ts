import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  title = 'Qalaqobana';
  userName: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.updateUserName();
  }

  updateUserName(): void {
    const user = this.authService.getCurrentUser();
    this.userName = user ? user.username : null;
  }

  navigateToGame(path: string): void {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('გთხოვთ შეხვიდეთ სისტემაში', 'დახურვა', { duration: 3000 });
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
    this.userName = null;
    this.router.navigate(['/']);
    this.snackBar.open('გამოსვლა წარმატებით დასრულდა', 'დახურვა', { duration: 3000 });
  }
} 