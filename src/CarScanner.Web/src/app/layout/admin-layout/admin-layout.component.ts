import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { TopbarComponent } from '../components/topbar/topbar.component';
import { AuthStore } from '../../core/auth/store/auth.store';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="cs-app-shell">
      <app-sidebar />
      <div class="cs-main-col">
        <app-topbar />
        <main class="cs-content-area">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .cs-app-shell {
        min-height: 100vh;
        display: flex;
        background: var(--cs-bg-0);
      }

      .cs-main-col {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }

      .cs-content-area {
        flex: 1;
        overflow-y: auto;
        background:
          radial-gradient(900px 500px at 15% 0%, rgba(216, 255, 60, 0.03), transparent 70%),
          var(--cs-bg-0);
      }
    `,
  ],
})
export class AdminLayoutComponent implements OnInit {
  private readonly authStore = inject(AuthStore);

  ngOnInit(): void {
    this.authStore.checkAuth();
  }
}
