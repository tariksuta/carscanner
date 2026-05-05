import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ServiceBookService } from '../services/service-book.service';
import { ServiceRecordSummary, SERVICE_RECORD_TYPE_LABELS } from '../models/service-book.model';

@Component({
  selector: 'app-service-records-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">Servisni zapisi</h1>
          <p class="cs-page-sub">Svi izvršeni servisi za flotu</p>
        </div>
        <a routerLink="/service-book/records/new" class="cs-btn-primary">
          <lucide-icon name="plus" [size]="15" /> Dodaj servis
        </a>
      </header>

      @if (loading()) {
        <div class="cs-loading">Učitavanje…</div>
      } @else if (records().length === 0) {
        <div class="cs-empty">
          <lucide-icon name="wrench" [size]="36" />
          <p>Još nema unesenih servisa.</p>
          <a routerLink="/service-book/records/new" class="cs-btn-secondary">Dodaj prvi servis</a>
        </div>
      } @else {
        <div class="cs-table-wrap">
          <table class="cs-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Vozilo</th>
                <th>Tip servisa</th>
                <th>Kilometraža</th>
                <th>Servis</th>
                <th class="cs-num">Cijena</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (r of records(); track r.id) {
                <tr>
                  <td>{{ r.serviceDate | date: 'dd.MM.yyyy' }}</td>
                  <td>{{ r.vehicleDisplayName }}</td>
                  <td>{{ typeLabel(r.type) }}</td>
                  <td>{{ r.mileageAtService | number }} km</td>
                  <td>{{ r.workshopName ?? '—' }}</td>
                  <td class="cs-num">{{ r.cost | number: '1.2-2' }} {{ r.currency }}</td>
                  <td class="cs-actions">
                    <button class="cs-icon-btn" (click)="onEdit(r.id)" title="Uredi">
                      <lucide-icon name="pencil" [size]="14" />
                    </button>
                    <button class="cs-icon-btn cs-icon-btn--danger" (click)="onDelete(r.id)" title="Obriši">
                      <lucide-icon name="trash-2" [size]="14" />
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
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
        margin: 0;
      }
      .cs-page-sub {
        font-size: 13px;
        color: var(--cs-text-tertiary);
        margin: 4px 0 0;
      }
      .cs-btn-primary,
      .cs-btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border-radius: 9px;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
      }
      .cs-btn-primary {
        background: var(--cs-accent);
        border: none;
        color: var(--cs-accent-ink);
      }
      .cs-btn-secondary {
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-primary);
      }
      .cs-loading,
      .cs-empty {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
        background: var(--cs-bg-2);
        border: 1px dashed var(--cs-border);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .cs-table-wrap {
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        border-radius: 10px;
        overflow: hidden;
      }
      .cs-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .cs-table th,
      .cs-table td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid var(--cs-border);
      }
      .cs-table th {
        background: var(--cs-bg);
        font-size: 11px;
        text-transform: uppercase;
        color: var(--cs-text-tertiary);
        font-weight: 600;
        letter-spacing: 0.04em;
      }
      .cs-table tbody tr:last-child td {
        border-bottom: none;
      }
      .cs-num {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .cs-actions {
        display: flex;
        gap: 6px;
        justify-content: flex-end;
      }
      .cs-icon-btn {
        background: var(--cs-bg);
        border: 1px solid var(--cs-border);
        border-radius: 6px;
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--cs-text-secondary);
        cursor: pointer;
      }
      .cs-icon-btn:hover {
        color: var(--cs-text-primary);
      }
      .cs-icon-btn--danger:hover {
        color: #ef4444;
        border-color: rgba(239, 68, 68, 0.4);
      }
    `,
  ],
})
export class ServiceRecordsListPageComponent implements OnInit {
  private readonly service = inject(ServiceBookService);
  private readonly router = inject(Router);

  protected readonly records = signal<ServiceRecordSummary[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.service.getRecords(null, 1, 100).subscribe({
      next: (res) => {
        this.records.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected typeLabel(type: number): string {
    return SERVICE_RECORD_TYPE_LABELS[type as keyof typeof SERVICE_RECORD_TYPE_LABELS] ?? '—';
  }

  protected onEdit(id: string): void {
    this.router.navigate(['/service-book/records', id, 'edit']);
  }

  protected onDelete(id: string): void {
    if (!confirm('Obrisati ovaj servisni zapis?')) return;
    this.service.deleteRecord(id).subscribe({
      next: () => this.load(),
    });
  }
}
