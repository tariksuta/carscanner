import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { VehicleStore } from '../store/vehicle.store';
import { VehicleTableComponent } from '../components/vehicle-table.component';
import { VehicleCardComponent } from '../components/vehicle-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SegmentedComponent, SegmentedOption } from '../../../shared/components/segmented/segmented.component';

type VehicleView = 'grid' | 'list';

@Component({
  selector: 'app-vehicle-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    VehicleTableComponent,
    VehicleCardComponent,
    PaginationComponent,
    SegmentedComponent,
  ],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">Vozila</h1>
          <p class="cs-page-sub">Upravljaj flotom</p>
        </div>
        <div class="cs-head-actions">
          <app-segmented [value]="view()" [options]="viewOptions" (changed)="view.set($event)" />
          <button type="button" class="cs-btn-primary" (click)="onCreate()">
            <lucide-icon name="plus" [size]="15" /> Dodaj vozilo
          </button>
        </div>
      </header>

      <div class="cs-search">
        <lucide-icon name="search" [size]="14" />
        <input type="text" placeholder="Traži po marki, modelu, tablicama…" (input)="onSearch($event)" />
      </div>

      @if (store.isLoading()) {
        <div class="cs-loading">Učitavanje…</div>
      } @else {
        @if (view() === 'grid') {
          <div class="cs-grid">
            @for (v of store.entities(); track v.id) {
              <app-vehicle-card [vehicle]="v" (activate)="onView($event)" />
            } @empty {
              <div class="cs-empty">Nema vozila</div>
            }
          </div>
        } @else {
          <app-vehicle-table [vehicles]="store.entities()" (view)="onView($event)" />
        }
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
      .cs-head-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .cs-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border-radius: 9px;
        background: var(--cs-accent);
        border: none;
        color: var(--cs-accent-ink);
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-search {
        position: relative;
        display: inline-flex;
        align-items: center;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        border-radius: 9px;
        padding: 0 10px;
        color: var(--cs-text-tertiary);
        width: 320px;
        max-width: 100%;
      }
      .cs-search input {
        background: transparent;
        border: none;
        outline: none;
        padding: 9px 6px;
        flex: 1;
        font-family: var(--font-text);
        font-size: 13px;
        color: var(--cs-text-primary);
      }
      .cs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 14px;
      }
      .cs-loading,
      .cs-empty {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
      }
    `,
  ],
})
export class VehicleListPageComponent implements OnInit {
  protected readonly store = inject(VehicleStore);
  private readonly router = inject(Router);
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly view = signal<VehicleView>('grid');
  readonly viewOptions: SegmentedOption<VehicleView>[] = [
    { value: 'grid', label: 'Grid' },
    { value: 'list', label: 'Lista' },
  ];

  ngOnInit(): void {
    this.store.loadVehicles();
  }

  onSearch(event: Event): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.store.setSearchQuery((event.target as HTMLInputElement).value);
      this.store.loadVehicles();
    }, 300);
  }

  onPageChange(page: number): void {
    this.store.setPage(page);
    this.store.loadVehicles();
  }

  onView(id: string): void {
    this.router.navigate(['/vehicles', id]);
  }

  onCreate(): void {
    this.router.navigate(['/vehicles', 'new']);
  }
}
