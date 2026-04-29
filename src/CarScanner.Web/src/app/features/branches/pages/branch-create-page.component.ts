import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BranchFormComponent } from '../components/branch-form.component';

@Component({
  selector: 'app-branch-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BranchFormComponent],
  template: `<app-branch-form mode="create" (saved)="onSaved()" />`,
})
export class BranchCreatePageComponent {
  private readonly router = inject(Router);

  onSaved(): void {
    this.router.navigate(['/branches']);
  }
}
