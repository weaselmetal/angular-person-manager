import { ValidatorFn } from "@angular/forms";
import { isPresent } from "../core/utils";

export const universeAgeValidator: ValidatorFn = (control) => {
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