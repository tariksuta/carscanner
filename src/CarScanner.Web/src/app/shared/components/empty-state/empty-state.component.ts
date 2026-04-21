import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
      <p class="text-lg font-medium text-muted-foreground">{{ message() }}</p>
      @if (description()) {
        <p class="mt-1 text-sm text-muted-foreground">{{ description() }}</p>
      }
      <div class="mt-4">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  message = input('No data found');
  description = input<string>();
}
