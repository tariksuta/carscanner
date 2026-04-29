import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { EmployeeStore } from '../store/employee.store';
import { EmployeeService } from '../services/employee.service';
import {
  EMPLOYEE_MODULE_LABELS,
  EmployeeRole,
  INSPECTION_TYPE_LABELS,
} from '../models/employee.model';
import { GrantLoginDialogComponent } from '../components/grant-login-dialog.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

type EmployeeStatus = 'active' | 'field' | 'offline';

interface PermissionRow {
  moduleLabel: string;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

interface InspectionRow {
  id: string;
  type: 'Preuzimanje' | 'Povrat';
  vehicle: string;
  when: string;
  duration: string;
  damage: boolean;
  completed: boolean;
}

@Component({
  selector: 'app-employee-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, LucideAngularModule, StatCardComponent, StatusBadgeComponent, GrantLoginDialogComponent],
  template: `
    <div class="cs-page">
      @if (store.selectedEmployee(); as emp) {
        <header class="cs-detail-head">
          <button type="button" class="cs-back-btn" (click)="goBack()" aria-label="Nazad">
            <lucide-icon name="chevron-left" [size]="16" />
          </button>
          <div class="cs-avatar-wrap">
            <span class="cs-avatar-xl">{{ initials() }}</span>
            <span class="cs-status-dot" [attr.data-status]="statusKey()"></span>
          </div>
          <div class="cs-head-main">
            <div class="cs-head-badges">
              <app-status-badge
                [label]="emp.isActive ? 'Aktivan' : 'Deaktiviran'"
                [variant]="emp.isActive ? 'success' : 'danger'"
              />
              @if (roleLabel(); as role) {
                <span class="cs-role-tag">{{ role }}</span>
              }
            </div>
            <h1 class="cs-page-title">{{ emp.firstName }} {{ emp.lastName }}</h1>
            <p class="cs-page-sub">
              @if (emp.branchCity) {
                {{ emp.branchCity }} ·
              }
              <span class="cs-accent-text">{{ statusLabel() }}</span>
            </p>
          </div>
          <div class="cs-head-actions">
            <button type="button" class="cs-btn-ghost">
              <lucide-icon name="message-square" [size]="14" /> Pošalji poruku
            </button>
            <button type="button" class="cs-btn-ghost" (click)="onEdit()">
              <lucide-icon name="pencil" [size]="14" /> Uredi
            </button>
            @if (!emp.applicationUserId && emp.isActive) {
              <button type="button" class="cs-btn-ghost" (click)="onGrantLoginAccess()">
                <lucide-icon name="key" [size]="14" /> Dodijeli login pristup
              </button>
            }
            @if (emp.isActive) {
              <button type="button" class="cs-btn-danger" (click)="onDeactivate()">
                <lucide-icon name="user-x" [size]="14" /> Deaktiviraj
              </button>
            }
          </div>
        </header>

        <section class="cs-grid-4">
          <app-stat-card
            label="Inspekcija ukupno"
            [value]="totalInspectionsValue()"
            [delta]="monthDelta()"
            icon="clipboard-check"
            [footer]="thisMonthFooter()"
          />
          <app-stat-card
            label="Prosjek trajanja"
            [value]="avgDurationValue()"
            icon="clock"
            [footer]="teamAvgFooter()"
          />
          <app-stat-card
            label="Završene"
            [value]="completedRateValue()"
            icon="check-circle"
            [footer]="completedRateFooter()"
          />
          <app-stat-card
            label="Stopa detekcije"
            [value]="damageDetectionValue()"
            icon="shield-alert"
            [footer]="damageDetectionFooter()"
          />
        </section>

        <section class="cs-grid-2">
          <article class="cs-card">
            <header class="cs-card-head">
              <div class="cs-card-title">Informacije</div>
            </header>
            <dl class="cs-dl">
              <div><dt>Email</dt><dd>{{ emp.email }}</dd></div>
              <div><dt>Telefon</dt><dd class="mono">{{ emp.phone || '—' }}</dd></div>
              <div><dt>Uloga</dt><dd>{{ roleLabel() ?? '—' }}</dd></div>
              <div><dt>Lokacija</dt><dd>{{ locationLabel() }}</dd></div>
              <div><dt>U timu od</dt><dd class="mono">{{ emp.createdOnUtc | date: 'MMM yyyy' }}</dd></div>
              <div><dt>Pristupni nivo</dt><dd>{{ accessLabel() }}</dd></div>
              <div><dt>Zadnja prijava</dt><dd class="mono muted">{{ lastSignInLabel() }}</dd></div>
            </dl>
          </article>

          <article class="cs-card">
            <header class="cs-card-head">
              <div class="cs-card-title">Dozvole</div>
              <span class="cs-card-sub">Po modulu</span>
            </header>
            <div class="cs-perm-wrap">
              <table class="cs-perm">
                <thead>
                  <tr>
                    <th>Modul</th>
                    <th>Pregled</th>
                    <th>Izmjena</th>
                    <th>Brisanje</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of permissions(); track p.moduleLabel) {
                    <tr>
                      <td>{{ p.moduleLabel }}</td>
                      <td><span class="cs-check" [class.on]="p.view"></span></td>
                      <td><span class="cs-check" [class.on]="p.edit"></span></td>
                      <td><span class="cs-check" [class.on]="p.delete"></span></td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="cs-perm-empty">
                        @if (emp.hasLoginAccess) {
                          Nema podataka o dozvolama
                        } @else {
                          Bez login pristupa — nema dodijeljenih dozvola
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <article class="cs-card">
          <header class="cs-card-head">
            <div class="cs-card-title">Nedavne inspekcije</div>
          </header>
          <div class="cs-table-wrap">
            <table class="cs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tip</th>
                  <th>Vozilo</th>
                  <th>Kada</th>
                  <th>Trajanje</th>
                  <th>Šteta</th>
                </tr>
              </thead>
              <tbody>
                @for (i of inspections(); track i.id) {
                  <tr (click)="openInspection(i.id)">
                    <td class="mono muted">{{ shortId(i.id) }}</td>
                    <td>
                      <app-status-badge
                        [label]="i.type"
                        [variant]="i.type === 'Preuzimanje' ? 'info' : 'success'"
                      />
                    </td>
                    <td>{{ i.vehicle }}</td>
                    <td class="mono">{{ i.when }}</td>
                    <td class="mono">{{ i.duration }}</td>
                    <td>
                      @if (i.damage) {
                        <app-status-badge label="Da" variant="danger" />
                      } @else {
                        <span class="muted">—</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="cs-perm-empty">Nema inspekcija</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </article>
      } @else {
        <p class="cs-empty">Zaposlenik nije pronađen</p>
      }
    </div>

    <app-grant-login-dialog
      [open]="grantDialogOpen()"
      [employeeName]="grantDialogEmployeeName()"
      (confirm)="onGrantConfirm($event)"
      (cancel)="onGrantCancel()"
    />
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
      .cs-avatar-wrap {
        position: relative;
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
      .cs-status-dot {
        position: absolute;
        right: -2px;
        bottom: -2px;
        width: 14px;
        height: 14px;
        border-radius: 999px;
        border: 2px solid var(--cs-bg-0);
      }
      .cs-status-dot[data-status='active'] {
        background: var(--cs-status-active);
      }
      .cs-status-dot[data-status='field'] {
        background: var(--cs-status-info);
      }
      .cs-status-dot[data-status='offline'] {
        background: var(--cs-text-tertiary);
      }
      .cs-head-main {
        flex: 1;
        min-width: 240px;
      }
      .cs-head-badges {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }
      .cs-role-tag {
        font-size: 11px;
        color: var(--cs-text-tertiary);
        padding: 3px 8px;
        border-radius: 999px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border-subtle);
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
      .cs-btn-danger {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border-radius: 9px;
        background: transparent;
        border: 1px solid var(--cs-status-danger);
        color: var(--cs-status-danger);
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-btn-danger:hover {
        background: var(--cs-status-danger-soft);
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
        padding: 10px 0;
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-dl > div:last-child {
        border-bottom: none;
      }
      .cs-dl dt {
        font-size: 12px;
        color: var(--cs-text-tertiary);
      }
      .cs-dl dd {
        font-size: 13px;
        color: var(--cs-text-primary);
        margin: 0;
        text-align: right;
      }

      .cs-perm-wrap {
        overflow-x: auto;
      }
      .cs-perm {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-family: var(--font-text);
      }
      .cs-perm th {
        padding: 10px 16px;
        font-size: 10px;
        font-weight: 700;
        color: var(--cs-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        text-align: left;
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-perm th:first-child,
      .cs-perm td:first-child {
        padding-left: 20px;
      }
      .cs-perm th:not(:first-child),
      .cs-perm td:not(:first-child) {
        text-align: center;
        width: 80px;
      }
      .cs-perm td {
        padding: 10px 16px;
        font-size: 13px;
        color: var(--cs-text-primary);
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-perm tr:last-child td {
        border-bottom: none;
      }
      .cs-check {
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 4px;
        border: 1px dashed var(--cs-border);
        background: transparent;
      }
      .cs-check.on {
        border-style: solid;
        border-color: var(--cs-accent);
        background: var(--cs-accent-soft);
        position: relative;
      }
      .cs-check.on::after {
        content: '';
        position: absolute;
        left: 3px;
        top: 0px;
        width: 5px;
        height: 10px;
        border-right: 2px solid var(--cs-accent);
        border-bottom: 2px solid var(--cs-accent);
        transform: rotate(45deg);
      }
      .cs-perm-empty {
        padding: 24px 20px;
        text-align: center;
        color: var(--cs-text-tertiary);
        font-size: 12px;
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
export class EmployeeDetailPageComponent implements OnInit {
  readonly id = input.required<string>();
  protected readonly store = inject(EmployeeStore);
  private readonly svc = inject(EmployeeService);
  private readonly router = inject(Router);

  readonly initials = computed(() => {
    const e = this.store.selectedEmployee();
    if (!e) return '?';
    return `${e.firstName?.[0] ?? ''}${e.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  });

  readonly statusKey = computed<EmployeeStatus>(() => {
    const e = this.store.selectedEmployee();
    if (!e || !e.isActive || !e.hasLoginAccess) return 'offline';
    if (!e.lastSignInOnUtc) return 'offline';
    const ageMs = Date.now() - new Date(e.lastSignInOnUtc).getTime();
    return ageMs < 5 * 60 * 1000 ? 'active' : 'offline';
  });

  readonly statusLabel = computed(() => {
    switch (this.statusKey()) {
      case 'active':
        return 'Online';
      case 'field':
        return 'Na terenu';
      default:
        return 'Offline';
    }
  });

  readonly roleLabel = computed<string | null>(() => {
    const e = this.store.selectedEmployee();
    return e?.role ?? null;
  });

  readonly accessLabel = computed(() => {
    const e = this.store.selectedEmployee();
    if (!e) return '—';
    return e.hasLoginAccess ? 'Sa pristupom' : 'Bez pristupa';
  });

  readonly locationLabel = computed(() => {
    const e = this.store.selectedEmployee();
    if (!e) return '—';
    if (e.branchCity && e.branchName) return `${e.branchCity} · ${e.branchName}`;
    return e.branchCity ?? e.branchName ?? '—';
  });

  readonly lastSignInLabel = computed(() => {
    const e = this.store.selectedEmployee();
    if (!e?.lastSignInOnUtc) return 'Nikada';
    return this.formatRelativeTime(new Date(e.lastSignInOnUtc));
  });

  private formatRelativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 0) return 'upravo sada';
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return 'upravo sada';
    const min = Math.floor(sec / 60);
    if (min < 60) return `prije ${min} min`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `prije ${hr} h`;
    const days = Math.floor(hr / 24);
    if (days < 30) return `prije ${days} d`;
    const months = Math.floor(days / 30);
    if (months < 12) return `prije ${months} mj`;
    const years = Math.floor(days / 365);
    return `prije ${years} g`;
  }

  readonly permissions = computed<PermissionRow[]>(() =>
    this.store.selectedEmployeePermissions().map((p) => ({
      moduleLabel: EMPLOYEE_MODULE_LABELS[p.module] ?? p.module,
      view: p.view,
      edit: p.edit,
      delete: p.delete,
    })),
  );

  readonly totalInspectionsValue = computed(() => {
    const s = this.store.selectedEmployeeStats();
    return s ? s.totalInspections : '—';
  });

  readonly monthDelta = computed<number | null>(() => {
    const s = this.store.selectedEmployeeStats();
    return s?.monthOverMonthChangePercent ?? null;
  });

  readonly thisMonthFooter = computed(() => {
    const s = this.store.selectedEmployeeStats();
    if (!s) return null;
    return `Ovog mjeseca: ${s.inspectionsThisMonth}`;
  });

  readonly avgDurationValue = computed(() => {
    const s = this.store.selectedEmployeeStats();
    return this.formatDuration(s?.averageDurationSeconds ?? null);
  });

  readonly teamAvgFooter = computed(() => {
    const s = this.store.selectedEmployeeStats();
    if (!s) return null;
    return `Tim: ${this.formatDuration(s.teamAverageDurationSeconds)}`;
  });

  readonly completedRateValue = computed(() => {
    const s = this.store.selectedEmployeeStats();
    return this.formatPercent(s?.completedRatePercent ?? null);
  });

  readonly completedRateFooter = computed(() => {
    const s = this.store.selectedEmployeeStats();
    if (!s) return null;
    return `Od ${s.totalInspections} inspekcija`;
  });

  readonly damageDetectionValue = computed(() => {
    const s = this.store.selectedEmployeeStats();
    return this.formatPercent(s?.damageDetectionRatePercent ?? null);
  });

  readonly damageDetectionFooter = computed(() => {
    const s = this.store.selectedEmployeeStats();
    if (!s) return null;
    return `Povrati sa štetom: ${s.damageDetectionsCount}`;
  });

  private formatDuration(seconds: number | null): string {
    if (seconds == null || seconds <= 0) return '—';
    const total = Math.round(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  }

  private formatPercent(value: number | null): string {
    if (value == null) return '—';
    return `${value}%`;
  }

  readonly inspections = computed<InspectionRow[]>(() =>
    this.store.selectedEmployeeRecentInspections().map((i) => {
      const when = i.completedAt ?? i.createdOnUtc;
      const vehicle = `${i.vehicleBrand} ${i.vehicleModel}`.trim();
      return {
        id: i.id,
        type: INSPECTION_TYPE_LABELS[i.inspectionType] as 'Preuzimanje' | 'Povrat',
        vehicle: vehicle || '—',
        when: this.formatWhen(when),
        duration: this.formatDuration(i.durationSeconds),
        damage: i.hasDamage,
        completed: i.status === 'Completed',
      };
    }),
  );

  shortId(id: string): string {
    return `I-${id.slice(-4).toUpperCase()}`;
  }

  private formatWhen(iso: string): string {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}.${mm}. ${hh}:${mi}`;
  }

  ngOnInit(): void {
    const id = this.id();
    this.store.selectEmployee(id);
    this.store.loadEmployeeById(id);
    this.store.loadPermissions(id);
    this.store.loadStats(id);
    this.store.loadRecentInspections(id);
  }

  onEdit(): void {
    this.router.navigate(['/employees', this.id(), 'edit']);
  }

  onDeactivate(): void {
    // TODO: backend ne podržava deactivate (UpdateEmployeeRequest nema IsActive)
  }

  readonly grantDialogOpen = signal(false);
  readonly grantDialogEmployeeName = computed(() => {
    const e = this.store.selectedEmployee();
    return e ? `${e.firstName} ${e.lastName}` : '';
  });

  onGrantLoginAccess(): void {
    this.grantDialogOpen.set(true);
  }

  onGrantConfirm(role: EmployeeRole): void {
    this.grantDialogOpen.set(false);
    this.store.grantLoginAccess({ employeeId: this.id(), role });
  }

  onGrantCancel(): void {
    this.grantDialogOpen.set(false);
  }

  openInspection(id: string): void {
    this.router.navigate(['/inspections', id]);
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }
}
