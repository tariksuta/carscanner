import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { RentalStore } from '../store/rental.store';
import { RentalTableComponent } from '../components/rental-table.component';
import { VehicleStore } from '../../vehicles/store/vehicle.store';
import { ClientStore } from '../../clients/store/client.store';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterChipComponent } from '../../../shared/components/filter-chip/filter-chip.component';
import { RentalStatus } from '../models/rental.model';

type RentalFilter = 'all' | 'active' | 'upcoming' | 'ending' | 'done';

@Component({
  selector: 'app-rental-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, RentalTableComponent, PaginationComponent, FilterChipComponent],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">Rentali</h1>
          <p class="cs-page-sub">Upravljaj svim najmovima vozila</p>
        </div>
        <div class="cs-page-actions">
          <button type="button" class="cs-btn cs-btn-ghost">
            <lucide-icon name="download" [size]="14" /> Export CSV
          </button>
          <button type="button" class="cs-btn cs-btn-primary" (click)="onCreate()">
            <lucide-icon name="plus" [size]="15" /> Novi rental
          </button>
        </div>
      </header>

      <div class="cs-filter-row">
        <div class="cs-chips">
          <app-filter-chip
            [active]="filter() === 'all'"
            [count]="store.totalCount()"
            (pressed)="setFilter('all')"
          >Svi</app-filter-chip>
          <app-filter-chip
            [active]="filter() === 'active'"
            [count]="counts().active"
            (pressed)="setFilter('active')"
          >Aktivni</app-filter-chip>
          <app-filter-chip
            [active]="filter() === 'upcoming'"
            [count]="counts().upcoming"
            (pressed)="setFilter('upcoming')"
          >Nadolazeći</app-filter-chip>
          <app-filter-chip
            [active]="filter() === 'ending'"
            [count]="counts().ending"
            (pressed)="setFilter('ending')"
          >Povrat danas</app-filter-chip>
          <app-filter-chip
            [active]="filter() === 'done'"
            [count]="counts().done"
            (pressed)="setFilter('done')"
          >Završeni</app-filter-chip>
        </div>
        <div class="cs-spacer"></div>
        <div class="cs-search">
          <lucide-icon name="search" [size]="14" />
          <input
            type="text"
            placeholder="Traži po ID-u, klijentu, vozilu…"
            [value]="query()"
            (input)="onQuery($event)"
          />
        </div>
      </div>

      @if (store.isLoading()) {
        <div class="cs-loading">Učitavanje…</div>
      } @else {
        <app-rental-table [rentals]="filteredRentals()" (view)="onView($event)" />
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
      .cs-page-actions {
        display: flex;
        gap: 8px;
      }
      .cs-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border-radius: 9px;
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid transparent;
      }
      .cs-btn-ghost {
        background: var(--cs-bg-2);
        border-color: var(--cs-border);
        color: var(--cs-text-secondary);
      }
      .cs-btn-ghost:hover {
        color: var(--cs-text-primary);
        border-color: var(--cs-border-strong);
      }
      .cs-btn-primary {
        background: var(--cs-accent);
        color: var(--cs-accent-ink);
        font-weight: 600;
      }
      .cs-btn-primary:hover {
        filter: brightness(1.05);
      }

      .cs-filter-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .cs-chips {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .cs-spacer {
        flex: 1;
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
        width: 260px;
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

      .cs-loading {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
        font-size: 13px;
      }
    `,
  ],
})
export class RentalListPageComponent implements OnInit {
  protected readonly store = inject(RentalStore);
  private readonly vehicleStore = inject(VehicleStore);
  private readonly clientStore = inject(ClientStore);
  private readonly router = inject(Router);

  readonly filter = signal<RentalFilter>('all');
  readonly query = signal<string>('');

  readonly counts = computed(() => {
    const rentals = this.store.entities();
    return {
      active: rentals.filter((r) => r.status === RentalStatus.Active).length,
      upcoming: rentals.filter(
        (r) => r.status === RentalStatus.Pending || r.status === RentalStatus.PickupInProgress,
      ).length,
      ending: rentals.filter((r) => r.status === RentalStatus.ReturnInProgress).length,
      done: rentals.filter((r) => r.status === RentalStatus.Completed).length,
    };
  });

  readonly filteredRentals = computed(() => {
    const rentals = this.store.entities();
    const q = this.query().trim().toLowerCase();
    const f = this.filter();
    return rentals
      .filter((r) => {
        if (f === 'active') return r.status === RentalStatus.Active;
        if (f === 'upcoming')
          return r.status === RentalStatus.Pending || r.status === RentalStatus.PickupInProgress;
        if (f === 'ending') return r.status === RentalStatus.ReturnInProgress;
        if (f === 'done') return r.status === RentalStatus.Completed;
        return true;
      })
      .filter((r) => {
        if (!q) return true;
        return [r.id, r.vehicleId, r.clientId, r.notes ?? ''].some((v) =>
          v.toLowerCase().includes(q),
        );
      });
  });

  ngOnInit(): void {
    this.store.loadRentals();
    if (!this.vehicleStore.entities().length) this.vehicleStore.loadVehicles();
    if (!this.clientStore.entities().length) this.clientStore.loadClients();
  }

  setFilter(f: RentalFilter): void {
    this.filter.set(f);
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onPageChange(page: number): void {
    this.store.setPage(page);
    this.store.loadRentals();
  }

  onView(id: string): void {
    this.router.navigate(['/rentals', id]);
  }

  onCreate(): void {
    this.router.navigate(['/rentals', 'new']);
  }
}
