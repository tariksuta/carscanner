import { AbstractControl, ValidationErrors } from '@angular/forms';

export function licensePlateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  if (value.length < 2 || value.length > 15) {
    return { licensePlate: 'License plate must be between 2 and 15 characters' };
  }
  return null;
}
