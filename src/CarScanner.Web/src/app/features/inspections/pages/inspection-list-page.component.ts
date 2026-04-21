import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { InspectionStore } from '../store/inspection.store';
import { InspectionTableComponent } from '../components/inspection-table.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SegmentedComponent, SegmentedOption } from '../../../shared/components/segmented/segmented.component';
import { InspectionType } from '../models/inspection.model';

type InspectionSeg = 'all' | 'pickup' | 'return';

@Component({
  selector: 'app-inspection-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, InspectionTableComponent, PaginationComponent, SegmentedComponent],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">Inspekcije</h1>
          <p class="cs-page-sub">Preuzimanja i povrat — fotografski zapisi</p>
        </div>
        <app-segmented
          [value]="seg()"
          [options]="segOptions"
          (changed)="seg.set($event)"
        />
      </header>

      @if (store.isLoading()) {
        <div class="cs-loading">Učitavanje…</div>
      } @else {
        <app-inspection-table [inspections]="filtered()" (view)="onView($event)" />
        @if (store.totalPages() > 1) {
          <app-pagination
            [currentPage]="store.currentPage()"
            [totalPages]="store.totalPages()"
            [totalCount]="store.totalCount()"
            [pageSize]="store.pageSize()"
            [hasPreviousPage]="store.hasPreviousPage()"
            [hasNextPage]="store.hasNextPage()"
            (pageChange)="onPageChange($event)"
          />
        }
      }
    </div>
  `,
  styles: [
    `
      .cs-page {
        padding: 28px;
        max-width: 1600px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .cs-page-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .cs-page-title {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 700;
        color: var(--cs-text-primary);
        letter-spacing: -0.025em;
        margin: 0;
      }
      .cs-page-sub {
        font-size: 13px;
        color: var(--cs-text-tertiary);
        margin: 4px 0 0;
      }
      .cs-loading {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
      }
    `,
  ],
})
export class InspectionListPageComponent implements OnInit {
  protected readonly store = inject(InspectionStore);
  private readonly router = inject(Router);

  readonly seg = signal<InspectionSeg>('all');
  readonly segOptions: SegmentedOption<InspectionSeg>[] = [
    { value: 'all', label: 'Sve' },
    { value: 'pickup', label: 'Preuzimanja' },
    { value: 'return', label: 'Povrat' },
  ];

  readonly filtered = computed(() => {
    const all = this.store.entities();
    switch (this.seg()) {
      case 'pickup':
        return all.filter((i) => i.inspectionType === InspectionType.Pickup);
      case 'return':
        return all.filter((i) => i.inspectionType === InspectionType.Return);
      default:
        return all;
    }
  });

  ngOnInit(): void {
    this.store.loadInspections();
  }

  onPageChange(page: number): void {
    this.store.setPage(page);
    this.store.loadInspections();
  }

  onView(id: string): void {
    this.router.navigate(['/inspections', id]);
  }
}
