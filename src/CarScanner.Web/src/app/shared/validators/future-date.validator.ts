import { AbstractControl, ValidationErrors } from '@angular/forms';

export function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const date = new Date(value);
  if (date.getTime() <= Date.now()) {
    return { futureDate: 'Date must be in the future' };
  }
  return null;
}
