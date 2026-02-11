import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { universeAgeValidator } from '../features/persons/person-form/person-form';

@Directive({
  selector: '[appUniverseAge]',
  // in case of a validator directive, we have to tell Angular to provide it, along with existing ones
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: UniverseAge,
      multi: true
    }
  ]
})
export class UniverseAge implements Validator {

  constructor() { }

  validate(control: AbstractControl): ValidationErrors | null {
    return universeAgeValidator(control);
  }
}
