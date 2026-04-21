import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  template: `
    <div class="rounded-lg border border-border bg-card p-6">
      <p class="text-sm font-medium text-muted-foreground">{{ label() }}</p>
      <p class="mt-2 text-3xl font-bold text-card-foreground">{{ value() }}</p>
    </div>
  `,
})
export class StatsCardComponent {
  label = input.required<string>();
  value = input.required<number>();
}
