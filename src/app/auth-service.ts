import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs'; 

export type UserRole = 'ADMIN' | 'READER';

export interface User {
  name: string;
  role: UserRole;
}

export interface AuthDetails {
  user: User;
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  // user will stay logged in for 1h (= 60m x 60s x 1000ms)
  private readonly SESSION_DURATION = 1000 * 60 * 60;

  private readonly AUTH_DETAILS_STORAGE_KEY = 'authDetails';

  // State
  currentUser = signal<User | null>(null);
  
  // Computed signals
  isLoggedIn = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  // Internal: Holds the reference to the timer subscription so we can cancel it
  private authTimerSub: Subscription | null = null;

  constructor() {
    // we check the localStorage if we find authDetails and restore the user, if so.
    // we keep this information in the localStorage such that the user is logged in
    // in a new tab and when reloading the current page
    const adStr = localStorage.getItem(this.AUTH_DETAILS_STORAGE_KEY);
    if (adStr) {
       const authDetails = JSON.parse(adStr) as AuthDetails;
       if (authDetails.expiresAt > Date.now()) {
        // restore the user, but also the automatic logout behaviour
        this.currentUser.set(authDetails.user);
        this.autoLogoutAt(new Date(authDetails.expiresAt));
       } else {
        localStorage.removeItem(this.AUTH_DETAILS_STORAGE_KEY);
       }
    }
  }

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
      const expiresAt = new Date(new Date().getTime() + this.SESSION_DURATION);
      this.autoLogoutAt(expiresAt);

      const authDetails = { user: user, expiresAt: expiresAt.getTime() };
      localStorage.setItem(this.AUTH_DETAILS_STORAGE_KEY, JSON.stringify(authDetails));
      
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
    localStorage.removeItem(this.AUTH_DETAILS_STORAGE_KEY);

    this.router.navigate(['/login']);
  }

  // Helper to handle the timer logic
  private autoLogoutAt(expirationTime: Date) {
    // clear any existing timer to avoid multiple concurrent timers
    if (this.authTimerSub) {
      this.authTimerSub.unsubscribe();
    }

    // RxJS Timer: Waits for 'expirationDuration' ms, then emits once.
    // there's an overload of the timer function that takes a JS Date.
    this.authTimerSub = timer(expirationTime).subscribe(() => {
      console.log('Session expired -> Auto Logout');
      this.logout();
    });
  }
}