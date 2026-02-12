import { Directive, inject } from '@angular/core';
import { AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { nameAvailabilityValidator } from '../features/persons/person-form/person-form';
import { PersonService } from '../features/persons/person.service';
import { NotificationService } from '../core/notification-service';

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
    console.log(`NameAvailabilityDirective ${control.value}`);
    return this.validator(control);
  }
}
