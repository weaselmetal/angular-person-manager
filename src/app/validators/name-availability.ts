import { AsyncValidatorFn } from "@angular/forms";
import { NotificationService } from "../core/notification-service";
import { PersonService } from "../features/persons/person.service";
import { isPresent } from "../core/utils";
import { catchError, map, of, switchMap, tap, timer } from "rxjs";

/**
 * Closure that is to be initialised with the two services it needs.
 * The Closure remembers those arguments for later, when needed during execution of the Closure.
 * Executing this Closure just needs an AbstractControl as argument, as is specified by AsyncValidatorFn.
 * TS and reactive forms are fine with just this Closure. A directive (and class) that implements
 * AsyncValidator is not necessary in this case.
 */
export function nameAvailabilityValidator(
  personService: PersonService, notificationService: NotificationService): AsyncValidatorFn {

  return (control) => {

    if (control.pristine) {
      return of(null);
    }

    // no input is another validator's business, here we return null
    if (!isPresent(control.value) || control.value === '') {
      console.log(`Name input empty - another validator's business`);
      return of(null);
    }

    console.log(`User changed name input to ${control.value}`);

    // debouncing the user's input by 300s
    return timer(300).pipe(
      tap(() => { console.log(`debounced user input, checking ${control.value} now`) }),

      switchMap(() => personService.isNameAvailable(control.value)),

      map(isAvailable => {
        console.log(`Backend said name is available: ${isAvailable}`);
        if (isAvailable) {
          return null;
        } else {
          return { nameTaken: true }
        }
      }),

      // this validator should only produce an error, when the name is taken.
      // it should not respond with an error when the HTTP request failed!
      // so an unexpected service error signals 'all good' (null) by design
      catchError(() => { 
        console.log('service ran into an error');
        // throwError() is not expected here, it leads to an unhandled application error.
        // So don't do this:
        // return throwError(() => { serverNameCheckImpossible: true });
        // If an error should be returned and cause something in the UI, then one would have to do it like that:
        // return of({ serverNameCheckImpossible: true });
        // The UI could then react to this error. However, the form turns invalid and cannot be submitted.
        // In case of the service function running into an error, we want to ignore it (in this case),
        // such that the form can be submitted.

        // using our notificationService leaves the form valid and we can inform the user!
        notificationService.showWarning('Server-side name check did not work. Proceed at your own risk.');
        return of(null);
      })
    );
  }; 
}