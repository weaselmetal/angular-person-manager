import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { AuthService } from '../auth-service';
import { NotificationService } from './notification-service';

export const mainInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const notifyService = inject(NotificationService);

  return next(req).pipe(

    tap(event => {

      // event could be many things, we care about an HttpResponse
      if (event instanceof HttpResponse) {
        // we only get here if we successfully encounterd the 'next' event of the observed thing.
        // we could handle {next: , error: , complete: } in tap() also, but the catchError seems cleaner.
        // we don't want a toast when something loaded successfully
        if (req.method !== 'GET')
          notifyService.showSuccess('That worked!')
      }
    }),

    // catch an error response
    catchError((err: HttpErrorResponse) => {

      // 401 Unauthorized
      if (err.status === 401) {
        authService.logout();
        notifyService.showError('You are not / no longer authenticated.');
      } else if (err.status === 400) {
        notifyService.showWarning('The server could not make sense of the request we made');
      } else if (err.status === 403) {
        notifyService.showWarning('The server said you are not authorized to do this.');
      } else {
        notifyService.showError(`An error occurred. ${err.message}`);
      }

      // HttpInterceptorFn must return an observable, which we can return like this
      return throwError(() => err);
    })
  );
};