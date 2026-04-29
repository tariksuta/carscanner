import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Branch, CreateBranchRequest, UpdateBranchRequest } from '../models/branch.model';
import { BranchStore } from '../store/branch.store';
import { FormShellComponent } from '../../../shared/components/form-shell/form-shell.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

interface BranchFormState {
  name: string;
  city: string;
  address: string;
}

@Component({
  selector: 'app-branch-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FormShellComponent, FormFieldComponent],
  template: `
    <app-form-shell
      [title]="mode() === 'edit' ? 'Uredi poslovnicu' : 'Nova poslovnica'"
      [subtitle]="mode() === 'edit' ? 'Ažuriraj podatke poslovnice' : 'Dodaj novu poslovnicu u sistem'"
      [submitLabel]="mode() === 'edit' ? 'Sačuvaj izmjene' : 'Kreiraj poslovnicu'"
      [submitDisabled]="!canSubmit() || submitting()"
      [statusLabel]="mode() === 'edit' ? 'Izmjena' : null"
      statusVariant="info"
      (submitted)="submit()"
      (cancelled)="cancel()"
    >
      <section class="cs-card cs-pad">
        <h3 class="cs-sect-title">Podaci poslovnice</h3>
        <div class="cs-2col">
          <app-form-field label="Naziv" [required]="true" hint="npr. Baščaršija">
            <input type="text" [value]="state().name" (input)="upd('name', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Grad" [required]="true" hint="npr. Sarajevo">
            <input type="text" [value]="state().city" (input)="upd('city', $any($event.target).value)" />
          </app-form-field>
        </div>
        <div class="cs-row">
          <app-form-field label="Adresa" hint="Opcionalno">
            <input type="text" [value]="state().address" (input)="upd('address', $any($event.target).value)" />
          </app-form-field>
        </div>
      </section>
    </app-form-shell>
  `,
  styles: [
    `
      .cs-card {
        border-radius: 14px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
      }
      .cs-pad {
        padding: 20px;
      }
      .cs-sect-title {
        font-family: var(--font-display);
        font-size: 11px;
        font-weight: 700;
        color: var(--cs-text-tertiary);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin: 0 0 16px;
      }
      .cs-2col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .cs-row {
        margin-top: 14px;
      }
      @media (max-width: 700px) {
        .cs-2col {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class BranchFormComponent implements OnInit {
  readonly mode = input<'create' | 'edit'>('create');
  readonly branch = input<Branch | null>(null);
  readonly saved = output<string>();

  private readonly store = inject(BranchStore);
  private readonly router = inject(Router);

  readonly submitting = signal(false);

  readonly state = signal<BranchFormState>({
    name: '',
    city: '',
    address: '',
  });

  readonly canSubmit = computed(() => {
    const s = this.state();
    return !!s.name.trim() && !!s.city.trim();
  });

  ngOnInit(): void {
    const b = this.branch();
    if (b) {
      this.state.set({
        name: b.name,
        city: b.city,
        address: b.address ?? '',
      });
    }
  }

  upd<K extends keyof BranchFormState>(key: K, value: BranchFormState[K]): void {
    this.state.update((s) => ({ ...s, [key]: value }));
  }

  submit(): void {
    if (!this.canSubmit() || this.submitting()) return;
    const s = this.state();
    const address = s.address.trim() || undefined;

    if (this.mode() === 'edit' && this.branch()?.id) {
      const req: UpdateBranchRequest = {
        name: s.name.trim(),
        city: s.city.trim(),
        address,
      };
      this.submitting.set(true);
      this.store.update({
        id: this.branch()!.id,
        request: req,
        onSuccess: () => this.saved.emit(this.branch()!.id),
      });
      return;
    }

    const req: CreateBranchRequest = {
      name: s.name.trim(),
      city: s.city.trim(),
      address,
    };
    this.submitting.set(true);
    this.store.create({
      request: req,
      onSuccess: (id) => this.saved.emit(id),
    });
  }

  cancel(): void {
    this.router.navigate(['/branches']);
  }
}
