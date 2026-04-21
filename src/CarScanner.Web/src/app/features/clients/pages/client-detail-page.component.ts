import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ClientStore } from '../store/client.store';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface ActivityItem {
  icon: string;
  tone: 'accent' | 'active' | 'info' | 'danger';
  title: string;
  sub: string;
  time: string;
}

interface RentalRow {
  id: string;
  vehicle: string;
  plate: string;
  start: string;
  end: string;
  status: string;
  variant: 'success' | 'warning' | 'info' | 'danger' | 'default';
  price: number;
  hasDamage: boolean;
}

@Component({
  selector: 'app-client-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, LucideAngularModule, StatCardComponent, StatusBadgeComponent],
  template: `
    <div class="cs-page">
      @if (store.selectedClient(); as client) {
        <header class="cs-detail-head">
          <button type="button" class="cs-back-btn" (click)="goBack()" aria-label="Nazad">
            <lucide-icon name="chevron-left" [size]="16" />
          </button>
          <span class="cs-avatar-xl">{{ initials() }}</span>
          <div class="cs-head-main">
            <div class="cs-head-badges">
              <app-status-badge label="Aktivan" variant="success" />
              <app-status-badge label="VIP" variant="warning" />
            </div>
            <h1 class="cs-page-title">{{ client.firstName }} {{ client.lastName }}</h1>
            <p class="cs-page-sub">
              Klijent od {{ client.createdOnUtc | date: 'MMM yyyy' }} · 12 rentala · Profitabilnost
              <span class="cs-accent-text">A+</span>
            </p>
          </div>
          <div class="cs-head-actions">
            <button type="button" class="cs-btn-ghost">
              <lucide-icon name="mail" [size]="14" /> Kontaktiraj
            </button>
            <button type="button" class="cs-btn-ghost" (click)="onEdit()">
              <lucide-icon name="pencil" [size]="14" /> Uredi
            </button>
            <button type="button" class="cs-btn-primary" (click)="newRental()">
              <lucide-icon name="plus" [size]="15" /> Novi rental
            </button>
          </div>
        </header>

        <section class="cs-grid-4">
          <app-stat-card label="Ukupno rentala" value="12" [delta]="3" icon="key" footer="Zadnja 24 mjeseca" />
          <app-stat-card label="Ukupna potrošnja" value="4,820 KM" [delta]="18" icon="wallet" footer="Prosjek 402 KM" />
          <app-stat-card label="Prosjek trajanja" value="3.6" icon="clock" footer="Dana po rentalu" />
          <app-stat-card label="Štete" value="1" deltaTone="danger" icon="shield-alert" footer="Od 12 povrata" />
        </section>

        <section class="cs-grid-2">
          <article class="cs-card">
            <header class="cs-card-head">
              <div class="cs-card-title">Kontakt i identifikacija</div>
            </header>
            <dl class="cs-dl">
              <div><dt>Email</dt><dd>{{ client.email }}</dd></div>
              <div><dt>Telefon</dt><dd class="mono">{{ client.phone }}</dd></div>
              <div><dt>JMBG</dt><dd class="mono muted">—</dd></div>
              <div>
                <dt>Vozačka dozvola</dt>
                <dd class="mono">
                  {{ client.driverLicenseNumber }}
                  @if (client.driverLicenseExpiry) {
                    <span class="muted"> · vrijedi do {{ client.driverLicenseExpiry | date: 'dd.MM.yyyy' }}</span>
                  }
                </dd>
              </div>
              <div><dt>Adresa</dt><dd>{{ client.address || '—' }}</dd></div>
              <div><dt>Država izdavanja</dt><dd>{{ client.driverLicenseCountry }}</dd></div>
            </dl>
          </article>

          <article class="cs-card">
            <header class="cs-card-head">
              <div class="cs-card-title">Aktivnost</div>
              <span class="cs-card-sub">Zadnjih 30 dana</span>
            </header>
            <div class="cs-activity">
              @for (a of activity(); track a.title) {
                <div class="cs-activity-row">
                  <div class="cs-activity-icon" [attr.data-tone]="a.tone">
                    <lucide-icon [name]="a.icon" [size]="14" />
                  </div>
                  <div class="cs-activity-meta">
                    <div class="cs-activity-title">{{ a.title }}</div>
                    <div class="cs-activity-sub">{{ a.sub }}</div>
                  </div>
                  <div class="cs-activity-time mono">{{ a.time }}</div>
                </div>
              }
            </div>
          </article>
        </section>

        <article class="cs-card">
          <header class="cs-card-head">
            <div class="cs-card-title">Rentali</div>
            <span class="cs-card-sub">Historija najmova ovog klijenta</span>
          </header>
          <div class="cs-table-wrap">
            <table class="cs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vozilo</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th style="text-align: right">Iznos</th>
                </tr>
              </thead>
              <tbody>
                @for (r of rentals(); track r.id) {
                  <tr (click)="openRental(r.id)">
                    <td class="mono muted">{{ r.id }}</td>
                    <td>
                      <div class="cs-cell-primary">{{ r.vehicle }}</div>
                      <div class="cs-cell-secondary mono">{{ r.plate }}</div>
                    </td>
                    <td class="mono">{{ r.start }} → {{ r.end }}</td>
                    <td>
                      <div class="cs-status-cell">
                        <app-status-badge [label]="r.status" [variant]="r.variant" />
                        @if (r.hasDamage) {
                          <span class="cs-damage-dot" title="Šteta"></span>
                        }
                      </div>
                    </td>
                    <td style="text-align: right" class="mono cs-price">{{ r.price | number }} KM</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </article>
      } @else {
        <p class="cs-empty">Klijent nije pronađen</p>
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
      .cs-detail-head {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .cs-back-btn {
        width: 36px;
        height: 36px;
        border-radius: 9px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .cs-avatar-xl {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        background: linear-gradient(135deg, #3bd4a0, #5b9fff);
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-display);
        font-size: 18px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .cs-head-main {
        flex: 1;
        min-width: 240px;
      }
      .cs-head-badges {
        display: flex;
        gap: 6px;
        margin-bottom: 6px;
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
      .cs-accent-text {
        color: var(--cs-accent);
        font-weight: 600;
      }
      .cs-head-actions {
        display: flex;
        gap: 8px;
      }
      .cs-btn-ghost {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border-radius: 9px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-secondary);
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
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
      .cs-grid-4 {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
      }
      .cs-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      @media (max-width: 1000px) {
        .cs-grid-4 {
          grid-template-columns: repeat(2, 1fr);
        }
        .cs-grid-2 {
          grid-template-columns: 1fr;
        }
      }

      .cs-card {
        border-radius: 14px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        overflow: hidden;
      }
      .cs-card-head {
        padding: 16px 20px;
        border-bottom: 1px solid var(--cs-border-subtle);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .cs-card-title {
        font-family: var(--font-display);
        font-size: 14px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-card-sub {
        font-size: 12px;
        color: var(--cs-text-tertiary);
      }

      .cs-dl {
        margin: 0;
        padding: 8px 20px 16px;
      }
      .cs-dl > div {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-dl > div:last-child {
        border-bottom: none;
      }
      .cs-dl dt {
        font-size: 12px;
        color: var(--cs-text-tertiary);
        flex-shrink: 0;
      }
      .cs-dl dd {
        font-size: 13px;
        color: var(--cs-text-primary);
        margin: 0;
        text-align: right;
      }

      .cs-activity {
        display: flex;
        flex-direction: column;
      }
      .cs-activity-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 20px;
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-activity-row:last-child {
        border-bottom: none;
      }
      .cs-activity-icon {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .cs-activity-icon[data-tone='accent'] {
        background: var(--cs-accent-soft);
        color: var(--cs-accent);
      }
      .cs-activity-icon[data-tone='active'] {
        background: var(--cs-status-active-soft);
        color: var(--cs-status-active);
      }
      .cs-activity-icon[data-tone='info'] {
        background: var(--cs-status-info-soft);
        color: var(--cs-status-info);
      }
      .cs-activity-icon[data-tone='danger'] {
        background: var(--cs-status-danger-soft);
        color: var(--cs-status-danger);
      }
      .cs-activity-meta {
        flex: 1;
        min-width: 0;
      }
      .cs-activity-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-activity-sub {
        font-size: 11px;
        color: var(--cs-text-tertiary);
        margin-top: 2px;
      }
      .cs-activity-time {
        font-size: 11px;
        color: var(--cs-text-quaternary);
        flex-shrink: 0;
      }

      .cs-table-wrap {
        overflow-x: auto;
      }
      .cs-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-family: var(--font-text);
      }
      .cs-table th {
        padding: 12px 16px;
        text-align: left;
        font-size: 11px;
        font-weight: 600;
        color: var(--cs-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border-bottom: 1px solid var(--cs-border-subtle);
        white-space: nowrap;
      }
      .cs-table th:first-child,
      .cs-table td:first-child {
        padding-left: 20px;
      }
      .cs-table td {
        padding: 14px 16px;
        font-size: 13px;
        color: var(--cs-text-primary);
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-table tbody tr {
        cursor: pointer;
      }
      .cs-table tbody tr:hover {
        background: var(--cs-bg-2);
      }
      .cs-table tr:last-child td {
        border-bottom: none;
      }
      .cs-cell-primary {
        font-size: 13px;
        font-weight: 500;
        color: var(--cs-text-primary);
      }
      .cs-cell-secondary {
        font-size: 11px;
        color: var(--cs-text-tertiary);
        margin-top: 2px;
      }
      .cs-status-cell {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cs-damage-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: var(--cs-status-danger);
      }
      .cs-price {
        font-weight: 700;
      }
      .muted {
        color: var(--cs-text-tertiary);
      }
      .cs-empty {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
      }
    `,
  ],
})
export class ClientDetailPageComponent implements OnInit {
  readonly id = input.required<string>();
  protected readonly store = inject(ClientStore);
  private readonly router = inject(Router);

  readonly initials = computed(() => {
    const c = this.store.selectedClient();
    if (!c) return '?';
    return `${c.firstName?.[0] ?? ''}${c.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  });

  readonly activity = computed<ActivityItem[]>(() => [
    { icon: 'key', tone: 'accent', title: 'Rental započet', sub: 'BMW 320d · R-2041 · Baščaršija', time: 'prije 2d' },
    { icon: 'check', tone: 'active', title: 'Rental završen', sub: 'Renault Clio · R-2039 · bez štete', time: 'prije 5d' },
    { icon: 'shield-check', tone: 'info', title: 'Verifikacija identiteta', sub: 'Vozačka dozvola · OCR match 98%', time: 'prije 12d' },
    { icon: 'alert-triangle', tone: 'danger', title: 'Naplaćena šteta', sub: 'DR-1087 · 180 KM · osiguranje', time: 'prije 45d' },
  ]);

  readonly rentals = computed<RentalRow[]>(() => [
    { id: 'R-2041', vehicle: 'BMW 320d', plate: 'A12-E-345', start: '14.01.', end: '18.01.', status: 'Aktivan', variant: 'success', price: 480, hasDamage: false },
    { id: 'R-2039', vehicle: 'Renault Clio', plate: 'E10-O-456', start: '10.01.', end: '13.01.', status: 'Završen', variant: 'default', price: 180, hasDamage: false },
    { id: 'R-2012', vehicle: 'Škoda Octavia', plate: 'T77-K-221', start: '14.12.', end: '18.12.', status: 'Završen', variant: 'default', price: 320, hasDamage: true },
  ]);

  ngOnInit(): void {
    const id = this.id();
    this.store.selectClient(id);
    this.store.loadClientById(id);
  }

  onEdit(): void {
    this.router.navigate(['/clients', this.id(), 'edit']);
  }
  newRental(): void {
    this.router.navigate(['/rentals', 'new']);
  }
  openRental(id: string): void {
    this.router.navigate(['/rentals', id]);
  }
  goBack(): void {
    this.router.navigate(['/clients']);
  }
}
