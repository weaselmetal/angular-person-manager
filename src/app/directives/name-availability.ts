import { Directive, inject } from '@angular/core';
import { AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { PersonService } from '../features/persons/person.service';
import { NotificationService } from '../core/notification-service';
import { nameAvailabilityValidator } from '../validators/name-availability';

/**
 * Directives, like this one, are only needed when controls (HTML elements)
 * should offer certain functionality / behaviour - often found in template driven
 * forms. In this case, we want some async validation to happen, so this directive
 * has to implement the AsyncValidator interface, which just invokes our 
 * AsyncValidatorFn closure. Without the template driven form, the AsyncValidatorFn
 * closure would suffice. 
 */
@Directive({
  selector: '[appNameAvailability]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: NameAvailability,
      multi: true
    }
  ]
})
export class NameAvailability implements AsyncValidator {

  personService = inject(PersonService);
  notificationService = inject(NotificationService);

  // using our Closure here, providing the services it needs at construction time.
  // The signature of the closure still adheres to AsyncValidatorFn
  validator = nameAvailabilityValidator(this.personService, this.notificationService);

  constructor() { }

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.validator(control);
  }
}
