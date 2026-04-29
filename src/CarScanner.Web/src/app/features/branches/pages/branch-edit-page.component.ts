import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BranchFormComponent } from '../components/branch-form.component';
import { BranchStore } from '../store/branch.store';

@Component({
  selector: 'app-branch-edit-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BranchFormComponent],
  template: `
    @if (branch(); as b) {
      <app-branch-form mode="edit" [branch]="b" (saved)="onSaved()" />
    } @else {
      <p class="cs-empty">Poslovnica nije pronađena</p>
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
export class BranchEditPageComponent implements OnInit {
  readonly id = input.required<string>();
  private readonly store = inject(BranchStore);
  private readonly router = inject(Router);

  readonly branch = computed(() => this.store.entityMap()[this.id()] ?? null);

  ngOnInit(): void {
    if (!this.store.entities().length) {
      this.store.loadBranches();
    }
  }

  onSaved(): void {
    this.router.navigate(['/branches']);
  }
}
