import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/50" (click)="cancel.emit()"></div>
        <div class="relative z-50 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
          <h3 class="text-lg font-semibold text-card-foreground">{{ title() }}</h3>
          <p class="mt-2 text-sm text-muted-foreground">{{ message() }}</p>
          <div class="mt-4 flex justify-end gap-3">
            <button
              (click)="cancel.emit()"
              class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button
              (click)="confirm.emit()"
              class="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  open = input(false);
  title = input('Confirm Action');
  message = input('Are you sure you want to proceed?');
  confirm = output<void>();
  cancel = output<void>();
}
