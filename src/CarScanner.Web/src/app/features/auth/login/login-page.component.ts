import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { LoginFormComponent } from './login-form.component';
import { AuthStore } from '../../../core/auth/store/auth.store';
import { LoginRequest } from '../../../core/auth/models/auth.models';

@Component({
  selector: 'app-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, LoginFormComponent],
  template: `
    <div class="cs-login">
      <aside class="cs-login-hero">
        <div class="cs-hero-brand">
          <span class="cs-hero-mark">
            <lucide-icon name="scan-line" [size]="18" />
          </span>
          <span class="cs-hero-name">CarScanner</span>
        </div>
        <div class="cs-hero-copy">
          <h2>
            AI-powered<br />
            inspekcija vozila<br />
            <span class="cs-hero-accent">u 14 sekundi.</span>
          </h2>
          <p>
            Foto preuzimanje, foto povrat, automatska detekcija šteta —
            izvještaj spreman za osiguranje prije nego što klijent napusti parking.
          </p>
          <ul class="cs-hero-list">
            <li><span class="cs-hero-dot"></span> Top-down dijagram sa pinovima po težini</li>
            <li><span class="cs-hero-dot"></span> Before/after usporedba pickup → povrat</li>
            <li><span class="cs-hero-dot"></span> Procjena troška sa konfidencijom modela</li>
          </ul>
        </div>
        <div class="cs-hero-foot mono">© {{ year }} CarScanner · Sarajevo</div>
      </aside>

      <main class="cs-login-form">
        <div class="cs-form-card">
          <div class="cs-form-head">
            <h1>Dobrodošli nazad</h1>
            <p>Prijavi se da nastaviš sa flotom.</p>
          </div>
          @if (authStore.error()) {
            <div class="cs-form-err">{{ authStore.error() }}</div>
          }
          <app-login-form (submitLogin)="onLogin($event)" />
          <div class="cs-form-foot">
            <span>Problemi sa prijavom?</span>
            <a href="#">Kontaktiraj support</a>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .cs-login {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1fr 1fr;
        background: var(--cs-bg-0);
      }
      @media (max-width: 900px) {
        .cs-login {
          grid-template-columns: 1fr;
        }
        .cs-login-hero {
          display: none !important;
        }
      }
      .cs-login-hero {
        padding: 40px 48px;
        background:
          radial-gradient(600px 400px at 20% 10%, rgba(216, 255, 60, 0.1), transparent 60%),
          radial-gradient(500px 320px at 80% 90%, rgba(91, 159, 255, 0.08), transparent 60%),
          var(--cs-bg-1);
        border-right: 1px solid var(--cs-border-subtle);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .cs-hero-brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      .cs-hero-mark {
        width: 32px;
        height: 32px;
        border-radius: 9px;
        background: var(--cs-accent);
        color: var(--cs-accent-ink);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 1px rgba(216, 255, 60, 0.4), 0 8px 20px rgba(216, 255, 60, 0.18);
      }
      .cs-hero-name {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 16px;
        color: var(--cs-text-primary);
      }
      .cs-hero-copy {
        max-width: 480px;
      }
      .cs-hero-copy h2 {
        font-family: var(--font-display);
        font-size: 44px;
        line-height: 1.08;
        letter-spacing: -0.035em;
        font-weight: 700;
        color: var(--cs-text-primary);
        margin: 0 0 20px;
      }
      .cs-hero-accent {
        color: var(--cs-accent);
      }
      .cs-hero-copy p {
        color: var(--cs-text-secondary);
        font-size: 15px;
        line-height: 1.55;
        margin: 0 0 24px;
      }
      .cs-hero-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .cs-hero-list li {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        color: var(--cs-text-secondary);
      }
      .cs-hero-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: var(--cs-accent);
        flex-shrink: 0;
      }
      .cs-hero-foot {
        font-size: 11px;
        color: var(--cs-text-quaternary);
      }

      .cs-login-form {
        padding: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cs-form-card {
        width: 100%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .cs-form-head h1 {
        font-family: var(--font-display);
        font-size: 26px;
        font-weight: 700;
        color: var(--cs-text-primary);
        letter-spacing: -0.025em;
        margin: 0 0 6px;
      }
      .cs-form-head p {
        font-size: 13px;
        color: var(--cs-text-tertiary);
        margin: 0;
      }
      .cs-form-err {
        padding: 10px 12px;
        border-radius: 9px;
        background: var(--cs-status-danger-soft);
        color: var(--cs-status-danger);
        font-size: 12px;
        font-weight: 500;
      }
      .cs-form-foot {
        font-size: 12px;
        color: var(--cs-text-tertiary);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 1px solid var(--cs-border-subtle);
      }
      .cs-form-foot a {
        color: var(--cs-accent);
        text-decoration: none;
        font-weight: 600;
      }
    `,
  ],
})
export class LoginPageComponent {
  protected readonly authStore = inject(AuthStore);
  readonly year = new Date().getFullYear();

  onLogin(request: LoginRequest): void {
    this.authStore.login(request);
  }
}
