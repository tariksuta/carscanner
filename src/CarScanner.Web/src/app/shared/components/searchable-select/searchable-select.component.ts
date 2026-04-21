import { Component, input, output, signal, computed, ElementRef, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="relative">
      <input
        type="text"
        [placeholder]="placeholder()"
        [value]="displayValue()"
        (input)="onSearch($event)"
        (focus)="open()"
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      @if (selectedId() && displayValue()) {
        <button
          type="button"
          (click)="clear()"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
        >
          ✕
        </button>
      }
      @if (isOpen()) {
        <ul class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background py-1 shadow-lg">
          @for (option of filteredOptions(); track option.id) {
            <li
              (mousedown)="select(option)"
              class="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              [class.bg-accent]="option.id === selectedId()"
            >
              {{ option.label }}
            </li>
          } @empty {
            <li class="px-3 py-2 text-sm text-muted-foreground">No results found</li>
          }
        </ul>
      }
    </div>
  `,
})
export class SearchableSelectComponent {
  private readonly el = inject(ElementRef);

  options = input<SelectOption[]>([]);
  placeholder = input('Select...');
  selectedId = input<string | null>(null);

  selectionChange = output<string>();

  isOpen = signal(false);
  searchQuery = signal('');

  displayValue = computed(() => {
    const id = this.selectedId();
    if (id) {
      const match = this.options().find((o) => o.id === id);
      if (match) return match.label;
    }
    return this.searchQuery();
  });

  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(query));
  });

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  open(): void {
    this.isOpen.set(true);
    if (this.selectedId()) {
      this.searchQuery.set('');
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    if (!this.isOpen()) this.isOpen.set(true);
    if (value === '') {
      this.selectionChange.emit('');
    }
  }

  select(option: SelectOption): void {
    this.selectionChange.emit(option.id);
    this.searchQuery.set('');
    this.isOpen.set(false);
  }

  clear(): void {
    this.selectionChange.emit('');
    this.searchQuery.set('');
  }
}
