import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Branch } from '../models/branch.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-branch-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, StatusBadgeComponent],
  template: `
    <div class="cs-table-wrap">
      <table class="cs-table">
        <thead>
          <tr>
            <th>Naziv</th>
            <th>Grad</th>
            <th>Adresa</th>
            <th>Status</th>
            <th class="cs-actions-col">Akcije</th>
          </tr>
        </thead>
        <tbody>
          @for (b of branches(); track b.id) {
            <tr>
              <td class="cs-name">{{ b.name }}</td>
              <td>{{ b.city }}</td>
              <td class="muted">{{ b.address || '—' }}</td>
              <td>
                <app-status-badge
                  [label]="b.isActive ? 'Aktivna' : 'Neaktivna'"
                  [variant]="b.isActive ? 'success' : 'danger'"
                />
              </td>
              <td class="cs-actions">
                <button type="button" class="cs-icon-btn" (click)="edit.emit(b.id)" title="Uredi">
                  <lucide-icon name="pencil" [size]="14" />
                </button>
                @if (b.isActive) {
                  <button type="button" class="cs-icon-btn danger" (click)="toggleActive.emit({ id: b.id, isActive: false })" title="Deaktiviraj">
                    <lucide-icon name="power-off" [size]="14" />
                  </button>
                } @else {
                  <button type="button" class="cs-icon-btn" (click)="toggleActive.emit({ id: b.id, isActive: true })" title="Aktiviraj">
                    <lucide-icon name="power" [size]="14" />
                  </button>
                }
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="5" class="cs-empty">Nema poslovnica</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .cs-table-wrap {
        overflow-x: auto;
        border-radius: 14px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
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
      .cs-table tr:last-child td {
        border-bottom: none;
      }
      .cs-name {
        font-weight: 600;
      }
      .muted {
        color: var(--cs-text-tertiary);
      }
      .cs-actions-col {
        text-align: right;
        width: 120px;
      }
      .cs-actions {
        text-align: right;
        white-space: nowrap;
      }
      .cs-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        margin-left: 4px;
        border-radius: 8px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-secondary);
        cursor: pointer;
      }
      .cs-icon-btn:hover {
        background: var(--cs-bg-3, var(--cs-bg-2));
      }
      .cs-icon-btn.danger {
        color: var(--cs-status-danger);
        border-color: var(--cs-status-danger);
      }
      .cs-empty {
        padding: 32px;
        text-align: center;
        color: var(--cs-text-tertiary);
      }
    `,
  ],
})
export class BranchTableComponent {
  readonly branches = input.required<Branch[]>();
  readonly edit = output<string>();
  readonly toggleActive = output<{ id: string; isActive: boolean }>();
}
