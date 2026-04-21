import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DashboardService } from './services/dashboard.service';
import { DashboardStats } from './models/dashboard.models';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { AreaChartComponent, AreaChartPoint } from '../../shared/components/area-chart/area-chart.component';
import { DonutChartComponent } from '../../shared/components/donut-chart/donut-chart.component';
import { SegmentedComponent, SegmentedOption } from '../../shared/components/segmented/segmented.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LicensePlateComponent } from '../../shared/components/license-plate/license-plate.component';

type DashboardRange = '24h' | '7d' | '30d' | '90d';

interface AlertItem {
  tone: 'danger' | 'warning' | 'info';
  title: string;
  body: string;
  time: string;
  action: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    LucideAngularModule,
    StatCardComponent,
    AreaChartComponent,
    DonutChartComponent,
    SegmentedComponent,
    StatusBadgeComponent,
    LicensePlateComponent,
  ],
  template: `
    <div class="cs-dash">
      <header class="cs-dash-head">
        <div>
          <div class="cs-dash-date">{{ todayLabel() }}</div>
          <h1 class="cs-dash-title">
            Dobro jutro, {{ userName() }}
            <span class="muted">· {{ pendingInspections() }} {{ pendingInspectionsLabel() }} na čekanju.</span>
          </h1>
        </div>
        <app-segmented
          [value]="range()"
          [options]="rangeOptions"
          (changed)="range.set($event)"
        />
      </header>

      <section class="cs-grid-4">
        <app-stat-card
          label="Aktivni rentali"
          [value]="stats().activeRentals"
          [delta]="12"
          deltaTone="active"
          icon="key"
          [sparklineValues]="[8, 10, 9, 12, 11, 13, 14]"
          footer="8 preuzimanja danas"
        />
        <app-stat-card
          label="Dostupna vozila"
          [value]="stats().availableVehicles"
          [delta]="-4"
          deltaTone="danger"
          icon="car"
          [sparklineValues]="[12, 11, 10, 11, 10, 9, 9]"
          footer="2 na servisu, 1 na čišćenju"
        />
        <app-stat-card
          label="Inspekcije na čekanju"
          [value]="stats().pendingInspections"
          [delta]="50"
          deltaTone="danger"
          icon="clipboard-check"
          [sparklineValues]="[1, 2, 1, 2, 3, 2, 3]"
          footer="2 preuzimanja, 1 povrat"
        />
        <app-stat-card
          label="Detektirane štete"
          value="2"
          icon="shield-alert"
          [sparklineValues]="[0, 1, 0, 0, 1, 2, 2]"
          footer="Procjena: 340 KM"
        />
      </section>

      <section class="cs-grid-2-1">
        <article class="cs-card">
          <header class="cs-card-head">
            <div>
              <div class="cs-card-title">Aktivnost rentala & inspekcija</div>
              <div class="cs-card-sub">Zadnjih {{ rangeLabel() }}</div>
            </div>
            <div class="cs-legend">
              <span class="cs-legend-item"><span class="dot" style="background: var(--cs-accent)"></span>Rentali</span>
              <span class="cs-legend-item"><span class="dot" style="background: var(--cs-status-info)"></span>Inspekcije</span>
            </div>
          </header>
          <div class="cs-card-pad">
            <app-area-chart [data]="chartData" />
          </div>
        </article>

        <article class="cs-card">
          <header class="cs-card-head">
            <div>
              <div class="cs-card-title">Iskorištenost flote</div>
              <div class="cs-card-sub">{{ totalVehicles() }} vozila ukupno</div>
            </div>
          </header>
          <div class="cs-util">
            <app-donut-chart
              [size]="160"
              [thickness]="20"
              [segments]="utilSegments()"
              [centerValue]="utilizationPct() + '%'"
              centerLabel="iskorišteno"
            />
            <div class="cs-util-list">
              @for (row of utilSegments(); track row.label) {
                <div class="cs-util-row">
                  <span class="dot" [style.background]="row.color"></span>
                  <span class="cs-util-label">{{ row.label }}</span>
                  <span class="cs-util-val mono">{{ row.value }}</span>
                </div>
              }
            </div>
          </div>
        </article>
      </section>

      <section class="cs-grid-2-1">
        <article class="cs-card">
          <header class="cs-card-head">
            <div class="cs-card-title">Upozorenja</div>
            <button type="button" class="cs-card-link" (click)="goRentals()">Vidi sve →</button>
          </header>
          <div class="cs-alerts">
            @for (a of alerts; track a.title) {
              <div class="cs-alert">
                <div class="cs-alert-icon" [attr.data-tone]="a.tone">
                  <lucide-icon name="alert-triangle" [size]="16" />
                </div>
                <div class="cs-alert-body">
                  <div class="cs-alert-title">{{ a.title }}</div>
                  <div class="cs-alert-sub">{{ a.body }}</div>
                  <div class="cs-alert-meta">
                    <span class="cs-alert-time">{{ a.time }}</span>
                    <button type="button" class="cs-alert-action" [attr.data-tone]="a.tone">{{ a.action }} →</button>
                  </div>
                </div>
              </div>
            }
          </div>
        </article>

        <article class="cs-card">
          <header class="cs-card-head">
            <div class="cs-card-title">Tim online</div>
            <span class="cs-card-sub">3 zaposlenika na terenu</span>
          </header>
          <div class="cs-team">
            @for (m of team; track m.name) {
              <div class="cs-team-row">
                <div class="cs-team-avatar-wrap">
                  <span class="cs-team-avatar">{{ initials(m.name) }}</span>
                  <span class="cs-team-dot" [attr.data-status]="m.status"></span>
                </div>
                <div class="cs-team-meta">
                  <div class="cs-team-name">{{ m.name }}</div>
                  <div class="cs-team-role">{{ m.role }} · {{ m.location }}</div>
                </div>
              </div>
            }
          </div>
        </article>
      </section>

      <section class="cs-card">
        <header class="cs-card-head">
          <div class="cs-card-title">Aktivni i nadolazeći rentali</div>
          <button type="button" class="cs-card-link" (click)="goRentals()">Vidi sve →</button>
        </header>
        <div class="cs-table-wrap">
          <table class="cs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Klijent</th>
                <th>Vozilo</th>
                <th>Period</th>
                <th>Status</th>
                <th style="text-align: right">Iznos</th>
              </tr>
            </thead>
            <tbody>
              @for (r of recentRentals; track r.id) {
                <tr>
                  <td class="mono muted">{{ r.id }}</td>
                  <td>
                    <div class="cs-cell-2">
                      <span class="cs-avatar">{{ initials(r.client) }}</span>
                      <div>
                        <div class="cs-cell-primary">{{ r.client }}</div>
                        <div class="cs-cell-secondary">{{ r.phone }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="cs-cell-2">
                      <div>
                        <div class="cs-cell-primary">{{ r.vehicle }}</div>
                        <app-license-plate [plate]="r.plate" size="sm" />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="cs-cell-primary">{{ r.start }} → {{ r.end }}</div>
                    <div class="cs-progress">
                      <div class="cs-progress-track">
                        <div class="cs-progress-fill" [style.width.%]="r.progress * 100"></div>
                      </div>
                      <span class="cs-cell-secondary">{{ (r.progress * 100) | number: '1.0-0' }}%</span>
                    </div>
                  </td>
                  <td>
                    <app-status-badge [label]="r.status" [variant]="r.variant" />
                  </td>
                  <td style="text-align: right">
                    <span class="mono">{{ r.price }} KM</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .cs-dash {
        padding: 28px;
        max-width: 1600px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .cs-dash-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .cs-dash-date {
        font-size: 13px;
        color: var(--cs-text-tertiary);
        font-weight: 500;
        margin-bottom: 6px;
      }
      .cs-dash-title {
        font-family: var(--font-display);
        font-size: 28px;
        font-weight: 700;
        color: var(--cs-text-primary);
        letter-spacing: -0.03em;
        line-height: 1.1;
        margin: 0;
      }
      .cs-dash-title .muted {
        color: var(--cs-text-tertiary);
        font-weight: 500;
      }

      .cs-grid-4 {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
      }
      .cs-grid-2-1 {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 14px;
      }
      @media (max-width: 1100px) {
        .cs-grid-4 {
          grid-template-columns: repeat(2, 1fr);
        }
        .cs-grid-2-1 {
          grid-template-columns: 1fr;
        }
      }

      .cs-card {
        border-radius: 14px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .cs-card-head {
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-card-title {
        font-family: var(--font-display);
        font-size: 14px;
        font-weight: 600;
        color: var(--cs-text-primary);
        letter-spacing: -0.01em;
      }
      .cs-card-sub {
        font-size: 12px;
        color: var(--cs-text-tertiary);
        margin-top: 2px;
      }
      .cs-card-link {
        font-size: 12px;
        font-weight: 600;
        color: var(--cs-accent);
        background: transparent;
        border: none;
        cursor: pointer;
        font-family: var(--font-text);
      }
      .cs-card-pad {
        padding: 20px;
      }

      .cs-legend {
        display: flex;
        gap: 14px;
      }
      .cs-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: var(--cs-text-secondary);
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        display: inline-block;
      }

      .cs-util {
        padding: 20px 20px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }
      .cs-util-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .cs-util-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .cs-util-label {
        flex: 1;
        font-size: 12px;
        color: var(--cs-text-secondary);
      }
      .cs-util-val {
        font-size: 13px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }

      .cs-alerts {
        display: flex;
        flex-direction: column;
      }
      .cs-alert {
        padding: 14px 20px;
        display: flex;
        gap: 12px;
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-alert:last-child {
        border-bottom: none;
      }
      .cs-alert-icon {
        width: 32px;
        height: 32px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .cs-alert-icon[data-tone='danger'] {
        background: var(--cs-status-danger-soft);
        color: var(--cs-status-danger);
      }
      .cs-alert-icon[data-tone='warning'] {
        background: var(--cs-status-pending-soft);
        color: var(--cs-status-pending);
      }
      .cs-alert-icon[data-tone='info'] {
        background: var(--cs-status-info-soft);
        color: var(--cs-status-info);
      }
      .cs-alert-body {
        flex: 1;
        min-width: 0;
      }
      .cs-alert-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-alert-sub {
        font-size: 12px;
        color: var(--cs-text-secondary);
        margin-top: 2px;
      }
      .cs-alert-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 8px;
      }
      .cs-alert-time {
        font-size: 11px;
        color: var(--cs-text-tertiary);
      }
      .cs-alert-action {
        font-size: 11px;
        font-weight: 600;
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
      }
      .cs-alert-action[data-tone='danger'] {
        color: var(--cs-status-danger);
      }
      .cs-alert-action[data-tone='warning'] {
        color: var(--cs-status-pending);
      }
      .cs-alert-action[data-tone='info'] {
        color: var(--cs-status-info);
      }

      .cs-team {
        padding: 12px 20px 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .cs-team-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .cs-team-avatar-wrap {
        position: relative;
      }
      .cs-team-avatar,
      .cs-avatar {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: linear-gradient(135deg, #3bd4a0, #5b9fff);
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-display);
        font-size: 12px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .cs-avatar {
        width: 28px;
        height: 28px;
        border-radius: 7px;
      }
      .cs-team-dot {
        position: absolute;
        right: -2px;
        bottom: -2px;
        width: 10px;
        height: 10px;
        border-radius: 999px;
        border: 2px solid var(--cs-bg-1);
      }
      .cs-team-dot[data-status='active'] {
        background: var(--cs-status-active);
      }
      .cs-team-dot[data-status='info'] {
        background: var(--cs-status-info);
      }
      .cs-team-meta {
        flex: 1;
        min-width: 0;
      }
      .cs-team-name {
        font-size: 13px;
        font-weight: 500;
        color: var(--cs-text-primary);
      }
      .cs-team-role {
        font-size: 11px;
        color: var(--cs-text-tertiary);
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
        padding: 10px 16px;
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
        vertical-align: middle;
      }
      .cs-table tr:last-child td {
        border-bottom: none;
      }
      .cs-cell-2 {
        display: flex;
        align-items: center;
        gap: 10px;
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
      .muted {
        color: var(--cs-text-tertiary);
      }
      .cs-progress {
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .cs-progress-track {
        flex: 1;
        max-width: 120px;
        height: 3px;
        background: var(--cs-bg-3);
        border-radius: 999px;
        overflow: hidden;
      }
      .cs-progress-fill {
        height: 100%;
        background: var(--cs-accent);
      }
    `,
  ],
})
export class DashboardPageComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  readonly stats = signal<DashboardStats>({
    totalVehicles: 24,
    availableVehicles: 9,
    activeRentals: 14,
    pendingInspections: 3,
  });

  readonly range = signal<DashboardRange>('7d');
  readonly rangeOptions: SegmentedOption<DashboardRange>[] = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7 dana' },
    { value: '30d', label: '30 dana' },
    { value: '90d', label: '90 dana' },
  ];

  readonly totalVehicles = computed(() => this.stats().totalVehicles);
  readonly pendingInspections = computed(() => this.stats().pendingInspections);
  readonly pendingInspectionsLabel = computed(() => {
    const n = this.pendingInspections();
    return n === 1 ? 'inspekciju' : 'inspekcije';
  });

  readonly userName = computed(() => 'Amer');

  readonly todayLabel = computed(() => {
    const d = new Date();
    const days = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
    const months = [
      'januar',
      'februar',
      'mart',
      'april',
      'maj',
      'juni',
      'juli',
      'august',
      'septembar',
      'oktobar',
      'novembar',
      'decembar',
    ];
    return `${days[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
  });

  readonly rangeLabel = computed(() => {
    switch (this.range()) {
      case '24h':
        return '24 sata';
      case '7d':
        return '7 dana';
      case '30d':
        return '30 dana';
      case '90d':
        return '90 dana';
    }
  });

  readonly chartData: AreaChartPoint[] = [
    { label: 'Pon', primary: 8, secondary: 6 },
    { label: 'Uto', primary: 12, secondary: 9 },
    { label: 'Sri', primary: 10, secondary: 11 },
    { label: 'Čet', primary: 15, secondary: 12 },
    { label: 'Pet', primary: 22, secondary: 14 },
    { label: 'Sub', primary: 28, secondary: 19 },
    { label: 'Ned', primary: 18, secondary: 15 },
  ];

  readonly utilSegments = computed(() => [
    { label: 'Izdato', value: this.stats().activeRentals, color: 'var(--cs-accent)' },
    { label: 'Dostupno', value: this.stats().availableVehicles, color: 'var(--cs-status-info)' },
    { label: 'Servis / čišćenje', value: 1, color: 'var(--cs-status-pending)' },
  ]);

  readonly utilizationPct = computed(() => {
    const total = this.stats().totalVehicles || 1;
    return Math.round((this.stats().activeRentals / total) * 100);
  });

  readonly alerts: AlertItem[] = [
    {
      tone: 'danger',
      title: 'AI detektirao štetu',
      body: 'Rental R-2037 · Clio · procjena 340 KM',
      time: 'prije 12 min',
      action: 'Pregledaj',
    },
    {
      tone: 'warning',
      title: 'Povrat kasni 2h',
      body: 'Rental R-2040 · BMW 320d · A. Hodžić',
      time: 'prije 1h',
      action: 'Pozovi',
    },
    {
      tone: 'info',
      title: 'Servis istječe',
      body: 'Renault Clio · E10-O-456 · 89.432 km',
      time: 'danas',
      action: 'Zakaži',
    },
  ];

  readonly team: { name: string; role: string; location: string; status: 'active' | 'info' }[] = [
    { name: 'Nedim Kapetanović', role: 'Terenski inspektor', location: 'Sarajevo · Baščaršija', status: 'active' },
    { name: 'Selma Bešić', role: 'Recepcija', location: 'Sarajevo · Centar', status: 'active' },
    { name: 'Armin Džananović', role: 'Terenski inspektor', location: 'Sarajevo · Ilidža', status: 'info' },
  ];

  readonly recentRentals: {
    id: string;
    client: string;
    phone: string;
    vehicle: string;
    plate: string;
    start: string;
    end: string;
    progress: number;
    status: string;
    variant: 'success' | 'warning' | 'info' | 'default' | 'danger';
    price: number;
  }[] = [
    {
      id: 'R-2041',
      client: 'Adis Hodžić',
      phone: '+387 61 234 567',
      vehicle: 'BMW 320d',
      plate: 'A12-E-345',
      start: '14.01',
      end: '18.01',
      progress: 0.25,
      status: 'Aktivan',
      variant: 'success',
      price: 480,
    },
    {
      id: 'R-2040',
      client: 'Maja Šimić',
      phone: '+387 63 998 114',
      vehicle: 'Škoda Octavia',
      plate: 'T77-K-221',
      start: '12.01',
      end: '16.01',
      progress: 0.7,
      status: 'Povrat u toku',
      variant: 'info',
      price: 320,
    },
    {
      id: 'R-2039',
      client: 'Elvis Bego',
      phone: '+387 62 145 890',
      vehicle: 'Renault Clio',
      plate: 'E10-O-456',
      start: '10.01',
      end: '13.01',
      progress: 1,
      status: 'Završen',
      variant: 'default',
      price: 180,
    },
    {
      id: 'R-2038',
      client: 'Lejla Nuhić',
      phone: '+387 65 776 218',
      vehicle: 'VW Golf 7',
      plate: 'J55-M-118',
      start: '15.01',
      end: '17.01',
      progress: 0,
      status: 'Na čekanju',
      variant: 'warning',
      price: 210,
    },
    {
      id: 'R-2037',
      client: 'Armin Zulić',
      phone: '+387 61 420 100',
      vehicle: 'Renault Clio',
      plate: 'M91-A-802',
      start: '09.01',
      end: '12.01',
      progress: 1,
      status: 'Završen',
      variant: 'default',
      price: 190,
    },
  ];

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (s) => this.stats.set(s),
      error: () => {},
    });
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  goRentals(): void {
    this.router.navigate(['/rentals']);
  }
}
