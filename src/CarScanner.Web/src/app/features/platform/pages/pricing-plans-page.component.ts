import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-pricing-plans-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">Pricing planovi</h1>
          <p class="cs-page-sub">Sistemski definisani planovi sa cijenama AI tokena i feature gating-om</p>
        </div>
      </header>

      <div class="cs-empty">
        <lucide-icon name="tag" [size]="36" />
        <p>Pricing plans CRUD UI dolazi u sljedećoj fazi.</p>
        <p class="cs-hint">
          Trenutno se planovi dodjeljuju tenantima kroz <strong>Tenant Detail → Assign plan</strong> akciju.
          Sami planovi i njihovi feature flagovi (EnabledModules) trenutno se uređuju kroz SQL/seed.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .cs-page {
        padding: 28px;
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .cs-page-title {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 700;
        margin: 0;
        color: var(--cs-text-primary);
      }
      .cs-page-sub {
        font-size: 13px;
        color: var(--cs-text-tertiary);
        margin: 4px 0 0;
      }
      .cs-empty {
        padding: 64px 32px;
        text-align: center;
        color: var(--cs-text-tertiary);
        background: var(--cs-bg-2);
        border: 1px dashed var(--cs-border);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .cs-hint {
        font-size: 12px;
        max-width: 480px;
      }
    `,
  ],
})
export class PricingPlansPageComponent {}
