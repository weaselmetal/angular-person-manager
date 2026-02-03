import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth-service';

/**
 * Guard to ensure the user is logged in.
 * If not, redirects to the login page.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check the Signal from AuthService
  if (authService.isLoggedIn()) {
    return true; // Access granted
  }

  // Optional: You could show a toaster/alert here
  // alert("You need to be logged in.");

  // Not logged in? Redirect to /login
  // We return a UrlTree, which tells the Router to cancel the current navigation
  // and redirect to this new path instead.
  return router.createUrlTree(['/login']);
};

/**
 * Guard to ensure the user has ADMIN privileges.
 * If not, simply blocks the navigation (stays on the current page).
 */
export const adminGuard: CanActivateFn = () => {
  
  const authService = inject(AuthService);

  if (authService.isAdmin()) {
    return true; // Access granted
  }

  // Optional: You could show a toaster/alert here
  // alert("You need to be an admin to complete this action");
  
  // Return false cancels the navigation. The user stays where they are.
  return false; 
};