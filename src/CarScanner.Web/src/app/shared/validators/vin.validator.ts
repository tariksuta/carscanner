import { AbstractControl, ValidationErrors } from '@angular/forms';

export function vinValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  if (value.length !== 17) return { vin: 'VIN must be exactly 17 characters' };
  return null;
}
