import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <div class="flex items-center justify-between border-t border-border px-4 py-3">
      <div class="text-sm text-muted-foreground">
        Showing {{ startItem() }}–{{ endItem() }} of {{ totalCount() }}
      </div>
      <div class="flex items-center gap-2">
        <button
          (click)="pageChange.emit(currentPage() - 1)"
          [disabled]="!hasPreviousPage()"
          class="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          Previous
        </button>
        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="px-1 text-muted-foreground">...</span>
          } @else {
            <button
              (click)="pageChange.emit(page)"
              class="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors"
              [class]="page === currentPage()
                ? 'bg-primary text-primary-foreground'
                : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'"
            >
              {{ page }}
            </button>
          }
        }
        <button
          (click)="pageChange.emit(currentPage() + 1)"
          [disabled]="!hasNextPage()"
          class="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  totalCount = input.required<number>();
  pageSize = input.required<number>();
  hasPreviousPage = input.required<boolean>();
  hasNextPage = input.required<boolean>();

  pageChange = output<number>();

  startItem = computed(() => {
    if (this.totalCount() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalCount()));

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [1];
    if (current > 3) pages.push(-1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push(-1);
    pages.push(total);

    return pages;
  });
}
