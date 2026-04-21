import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { InspectionStore } from '../store/inspection.store';
import {
  INSPECTION_STATUS_LABELS,
  INSPECTION_TYPE_LABELS,
  InspectionStatus,
  InspectionType,
} from '../models/inspection.model';
import {
  StatusBadgeComponent,
  StatusBadgeVariant,
} from '../../../shared/components/status-badge/status-badge.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { InspectionPhotoGridComponent } from '../components/inspection-photo-grid.component';

@Component({
  selector: 'app-inspection-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    InspectionPhotoGridComponent,
    StatusBadgeComponent,
    DateFormatPipe,
  ],
  template: `
    <div class="cs-page">
      @if (store.selectedInspection(); as insp) {
        <header class="cs-detail-head">
          <div>
            <button type="button" class="cs-back" (click)="goBack()">
              <lucide-icon name="arrow-left" [size]="14" /> Nazad
            </button>
            <h1 class="cs-page-title">
              Inspekcija <span class="mono">{{ shortId(insp.id) }}</span>
            </h1>
            <div class="cs-detail-meta">
              <app-status-badge
                [label]="typeLabel(insp.inspectionType)"
                [variant]="insp.inspectionType === 0 ? 'info' : 'success'"
              />
              <app-status-badge
                [label]="statusLabel(insp.status)"
                [variant]="statusVariant(insp.status)"
              />
              <span class="mono cs-photos-count">{{ (insp.photos?.length ?? 0) }}/4 fotografija</span>
            </div>
          </div>
        </header>

        <div class="cs-detail-grid">
          <section class="cs-card">
            <header class="cs-card-head">
              <div class="cs-card-title">Fotografije vozila</div>
              <span class="cs-card-sub">4 pozicije: front, back, lijeva, desna</span>
            </header>
            <div class="cs-card-pad">
              <app-inspection-photo-grid [photos]="insp.photos ?? []" />
            </div>
          </section>

          <aside class="cs-meta-col">
            <section class="cs-card">
              <header class="cs-card-head">
                <div class="cs-card-title">Detalji</div>
              </header>
              <dl class="cs-dl">
                <div>
                  <dt>Rental</dt>
                  <dd class="mono">{{ shortId(insp.rentalId) }}</dd>
                </div>
                <div>
                  <dt>Vozilo</dt>
                  <dd class="mono">{{ shortId(insp.vehicleId) }}</dd>
                </div>
                <div>
                  <dt>Zaposlenik</dt>
                  <dd class="mono">{{ shortId(insp.employeeId) }}</dd>
                </div>
                <div>
                  <dt>Tip</dt>
                  <dd>{{ typeLabel(insp.inspectionType) }}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{{ statusLabel(insp.status) }}</dd>
                </div>
                @if (insp.completedAt) {
                  <div>
                    <dt>Završena</dt>
                    <dd class="mono">{{ insp.completedAt | dateFormat: 'datetime' }}</dd>
                  </div>
                }
              </dl>
            </section>

            @if (insp.notes) {
              <section class="cs-card">
                <header class="cs-card-head">
                  <div class="cs-card-title">Napomene</div>
                </header>
                <div class="cs-card-pad cs-notes">{{ insp.notes }}</div>
              </section>
            }
          </aside>
        </div>
      } @else {
        <p class="cs-empty">Inspekcija nije pronađena</p>
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
        gap: 20px;
      }
      .cs-back {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: none;
        color: var(--cs-text-tertiary);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 8px;
      }
      .cs-back:hover {
        color: var(--cs-text-primary);
      }
      .cs-page-title {
        font-family: var(--font-display);
        font-size: 26px;
        font-weight: 700;
        color: var(--cs-text-primary);
        letter-spacing: -0.025em;
        margin: 0;
      }
      .cs-detail-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 8px;
        flex-wrap: wrap;
      }
      .cs-photos-count {
        font-size: 12px;
        color: var(--cs-text-tertiary);
      }
      .cs-detail-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 14px;
      }
      @media (max-width: 1000px) {
        .cs-detail-grid {
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
        padding: 14px 20px;
        border-bottom: 1px solid var(--cs-border-subtle);
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
        margin-top: 2px;
        display: block;
      }
      .cs-card-pad {
        padding: 20px;
      }
      .cs-meta-col {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .cs-dl {
        margin: 0;
        padding: 8px 20px 16px;
      }
      .cs-dl > div {
        display: flex;
        justify-content: space-between;
        gap: 10px;
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
      }
      .cs-notes {
        font-size: 13px;
        color: var(--cs-text-secondary);
        line-height: 1.55;
      }
      .cs-empty {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
      }
    `,
  ],
})
export class InspectionDetailPageComponent implements OnInit {
  readonly id = input.required<string>();
  protected readonly store = inject(InspectionStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const id = this.id();
    this.store.selectInspection(id);
    this.store.loadInspectionById(id);
  }

  typeLabel(t: number): string {
    return this.bsType(t) ?? INSPECTION_TYPE_LABELS[t as InspectionType] ?? '—';
  }

  private bsType(t: number): string | null {
    return t === InspectionType.Pickup
      ? 'Preuzimanje'
      : t === InspectionType.Return
        ? 'Povrat'
        : null;
  }

  statusLabel(s: number): string {
    const bs: Record<InspectionStatus, string> = {
      [InspectionStatus.Pending]: 'Na čekanju',
      [InspectionStatus.InProgress]: 'U toku',
      [InspectionStatus.PhotosUploaded]: 'Fotke uploadane',
      [InspectionStatus.Completed]: 'Završena',
    };
    return bs[s as InspectionStatus] ?? INSPECTION_STATUS_LABELS[s as InspectionStatus] ?? '—';
  }

  statusVariant(s: number): StatusBadgeVariant {
    switch (s) {
      case InspectionStatus.Completed:
        return 'success';
      case InspectionStatus.InProgress:
        return 'info';
      case InspectionStatus.PhotosUploaded:
        return 'info';
      default:
        return 'warning';
    }
  }

  shortId(id: string): string {
    return id.length > 8 ? id.slice(0, 8).toUpperCase() : id;
  }

  goBack(): void {
    this.router.navigate(['/inspections']);
  }
}
