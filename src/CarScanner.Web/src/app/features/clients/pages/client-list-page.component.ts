import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ClientStore } from '../store/client.store';
import { ClientTableComponent } from '../components/client-table.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-client-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ClientTableComponent, LucideAngularModule, PaginationComponent],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">Klijenti</h1>
          <p class="cs-page-sub">Upravljaj bazom klijenata</p>
        </div>
        <button type="button" class="cs-btn-primary" (click)="onCreate()">
          <lucide-icon name="plus" [size]="15" /> Dodaj klijenta
        </button>
      </header>

      <div class="cs-search">
        <lucide-icon name="search" [size]="14" />
        <input type="text" placeholder="Traži po imenu, emailu, telefonu…" (input)="onSearch($event)" />
      </div>

      @if (store.isLoading()) {
        <div class="cs-loading">Učitavanje…</div>
      } @else {
        <app-client-table [clients]="store.entities()" (view)="onView($event)" />
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
      .cs-loading {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
      }
    `,
  ],
})
export class ClientListPageComponent implements OnInit {
  protected readonly store = inject(ClientStore);
  private readonly router = inject(Router);
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.store.loadClients();
  }

  onSearch(event: Event): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.store.setSearchQuery((event.target as HTMLInputElement).value);
      this.store.loadClients();
    }, 300);
  }

  onPageChange(page: number): void {
    this.store.setPage(page);
    this.store.loadClients();
  }

  onView(id: string): void {
    this.router.navigate(['/clients', id]);
  }

  onCreate(): void {
    this.router.navigate(['/clients', 'new']);
  }
}
