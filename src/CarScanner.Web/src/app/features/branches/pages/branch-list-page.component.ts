import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { BranchStore } from '../store/branch.store';
import { BranchTableComponent } from '../components/branch-table.component';

@Component({
  selector: 'app-branch-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BranchTableComponent, LucideAngularModule],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">Poslovnice</h1>
          <p class="cs-page-sub">Upravljaj lokacijama gdje radiš inspekcije</p>
        </div>
        <button type="button" class="cs-btn-primary" (click)="onCreate()">
          <lucide-icon name="plus" [size]="15" /> Dodaj poslovnicu
        </button>
      </header>

      <div class="cs-toolbar">
        <div class="cs-search">
          <lucide-icon name="search" [size]="14" />
          <input type="text" placeholder="Traži po nazivu, gradu, adresi…" (input)="onSearch($event)" />
        </div>
        <label class="cs-toggle">
          <input type="checkbox" [checked]="store.showInactive()" (change)="onToggleInactive($event)" />
          <span>Prikaži neaktivne</span>
        </label>
      </div>

      @if (store.isLoading()) {
        <div class="cs-loading">Učitavanje…</div>
      } @else {
        <app-branch-table
          [branches]="store.filtered()"
          (edit)="onEdit($event)"
          (toggleActive)="onToggleActive($event)"
        />
      }
    </div>
  `,
  styles: [
    `
      .cs-page {
        padding: 28px;
        max-width: 1400px;
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
      .cs-toolbar {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
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
      .cs-toggle {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--cs-text-secondary);
        cursor: pointer;
      }
      .cs-loading {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
      }
    `,
  ],
})
export class BranchListPageComponent implements OnInit {
  protected readonly store = inject(BranchStore);
  private readonly router = inject(Router);
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.store.loadBranches();
  }

  onSearch(event: Event): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.store.setSearchQuery((event.target as HTMLInputElement).value);
    }, 200);
  }

  onToggleInactive(event: Event): void {
    this.store.setShowInactive((event.target as HTMLInputElement).checked);
  }

  onCreate(): void {
    this.router.navigate(['/branches', 'new']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/branches', id, 'edit']);
  }

  onToggleActive(payload: { id: string; isActive: boolean }): void {
    this.store.setActive(payload);
  }
}
