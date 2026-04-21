import { Component, output, input } from '@angular/core';

@Component({
  selector: 'app-search-input',
  standalone: true,
  template: `
    <input
      type="text"
      [placeholder]="placeholder()"
      (input)="onInput($event)"
      class="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  `,
})
export class SearchInputComponent {
  placeholder = input('Search...');
  search = output<string>();

  onInput(event: Event): void {
    this.search.emit((event.target as HTMLInputElement).value);
  }
}
