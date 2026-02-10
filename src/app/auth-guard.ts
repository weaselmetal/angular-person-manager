import { inject } from '@angular/core';
import { ActivatedRoute, Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth-service';
import { NotificationService } from './core/notification-service';

/**
 * Guard to ensure the user is logged in.
 * If not, redirects to the login page.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  // Check the Signal from AuthService
  if (authService.isLoggedIn()) {
    return true; // Access granted
  }

  notificationService.showWarning('Please log in');

  // Not logged in? Redirect to /login
  // We return a UrlTree, which tells the Router to cancel the current navigation
  // and redirect to this new path instead.
  return router.createUrlTree(['/login']);
};

/**
 * Guard to ensure the user has ADMIN privileges.
 * If not, simply blocks the navigation (stays on the current page).
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true; // Access granted
  }

  // inform the user about the missing priviledge (i.e. role)
  notificationService.showWarning(`Redirected from ${state.url} because you are not an "Admin"`);
  
  // in case we try to open /persons/5/edit as a READER, return false; just
  // takes us to the app root (URL '/') which isn't helpful
  return router.createUrlTree(['/persons']);
};