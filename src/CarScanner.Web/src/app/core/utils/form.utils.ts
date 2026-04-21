import { AbstractControl, FormGroup } from '@angular/forms';

export function markFormAsTouched(form: FormGroup): void {
  Object.values(form.controls).forEach((control) => {
    control.markAsTouched();
    if (control instanceof FormGroup) {
      markFormAsTouched(control);
    }
  });
}

export function getControlError(control: AbstractControl | null): string | null {
  if (!control || !control.errors || !control.touched) return null;

  const errors = control.errors;
  if (errors['required']) return 'This field is required';
  if (errors['email']) return 'Invalid email format';
  if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters`;
  if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters`;
  if (errors['min']) return `Minimum value is ${errors['min'].min}`;
  if (errors['max']) return `Maximum value is ${errors['max'].max}`;
  if (errors['pattern']) return 'Invalid format';

  return 'Invalid value';
}
