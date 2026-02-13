import { ValidatorFn } from "@angular/forms";
import { isPresent } from "../core/utils";

export const universeAgeValidator: ValidatorFn = (control) => {
  if (control.pristine) {
    return null;
  }

  // we don't debounce here. This client-side check is cheap and
  // doesn't warrant the overhead of turning this sync validator
  // into and async validator. we don't want to deal with the 
  // async validator's state in this case.

  // retrieve the values
  const name = control.get('name')?.value as string;
  const age = control.get('age')?.value as number;

  // we don't validate if either name or age is missing;
  const hasName = isPresent(name);
  const hasAge = isPresent(age);
  if (!hasName || !hasAge) {
    return null;
  }

  if (name.toLowerCase().includes('universe') && age !== 42) {
    return { universeAgeMismatch: true };
  }

  // all good
  return null;
};

// using explicit typing is not needed, but here's how
// export const universeAgeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
//   const name = control.get('name')?.value as string;
//   const age = control.get('age')?.value as number;
//   if (!name || age === null || age === undefined) {
//     return null;
//   }
//   const isUniverse = name.toLowerCase().includes('universe');
//   if (isUniverse && age !== 42) {
//     return { universeAgeMismatch: true };
//   }
//   return null;
// };