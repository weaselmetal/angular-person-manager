import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs'; 

export type UserRole = 'ADMIN' | 'READER';

export interface User {
  name: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  // user will stay logged in for 1h (= 60m x 60s x 1000ms)
  private readonly SESSION_DURATION = 1000 * 60 * 60; 

  // State
  currentUser = signal<User | null>(null);
  
  // Computed signals
  isLoggedIn = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  // Internal: Holds the reference to the timer subscription so we can cancel it
  private authTimerSub: Subscription | null = null;

  /**
   * Attempt login using the passed credentials.
   * The `role` of the user will be set.
   * @param username of the user
   * @param pass of the user
   * @returns true if credentials were valid, false otherwise.
   */
  login(username: string, pass: string): boolean {
    // this is not a production ready implementation :)
    // one would use some server / service to do authentication and authorization here
    if (pass !== 'testtest')
      return false;

    let user: User | null = null;

    if (username === 'admin') {
      user = { name: username, role: 'ADMIN' };
    } else {
      user = { name: username, role: 'READER' };
    }

    if (user) {
      this.currentUser.set(user);
      
      // start the auto-logout timer
      // in production, the server would tell you when the session (or JWT access token) expires.
      this.autoLogout(this.SESSION_DURATION);
      
      this.router.navigate(['/persons']);
      return true;
    }

    return false;
  }

  logout() {
    this.currentUser.set(null);
    
    // Clean up the timer if the user logs out manually
    if (this.authTimerSub) {
      this.authTimerSub.unsubscribe();
      this.authTimerSub = null;
    }

    this.router.navigate(['/login']);
  }

  // Helper to handle the timer logic
  private autoLogout(expirationDuration: number) {
    // clear any existing timer to avoid multiple concurrent timers
    if (this.authTimerSub) {
      this.authTimerSub.unsubscribe();
    }

    // RxJS Timer: Waits for 'expirationDuration' ms, then emits once.
    // there's an overload of the timer function that takes a JS Date.
    this.authTimerSub = timer(expirationDuration).subscribe(() => {
      console.log('Session expired via Timer -> Auto Logout');
      this.logout();
    });
  }
}