import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientFormComponent } from '../components/client-form.component';
import { ClientStore } from '../store/client.store';

@Component({
  selector: 'app-client-edit-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ClientFormComponent],
  template: `
    @if (client(); as c) {
      <app-client-form mode="edit" [client]="c" (saved)="onSaved($event)" />
    } @else {
      <p class="cs-empty">Klijent nije pronađen</p>
    }
  `,
  styles: [
    `
      .cs-empty {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
      }
    `,
  ],
})
export class ClientEditPageComponent implements OnInit {
  readonly id = input.required<string>();
  private readonly store = inject(ClientStore);
  private readonly router = inject(Router);

  readonly client = computed(() => this.store.entityMap()[this.id()] ?? null);

  ngOnInit(): void {
    if (!this.store.entities().length) this.store.loadClients();
  }

  onSaved(id: string): void {
    this.router.navigate(['/clients', id]);
  }
}
