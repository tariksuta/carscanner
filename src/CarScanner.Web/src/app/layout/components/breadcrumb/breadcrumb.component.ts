import { Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="cs-breadcrumb">
      @for (crumb of breadcrumbs(); track crumb.url; let last = $last; let first = $first) {
        @if (!first) {
          <span class="cs-sep">/</span>
        }
        @if (!last) {
          <a [routerLink]="crumb.url" class="cs-crumb-link">{{ crumb.label }}</a>
        } @else {
          <span class="cs-crumb-current">{{ crumb.label }}</span>
        }
      }
    </nav>
  `,
  styles: [
    `
      .cs-breadcrumb {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--cs-text-tertiary);
        font-family: var(--font-text);
      }
      .cs-crumb-link {
        color: var(--cs-text-secondary);
        text-decoration: none;
        transition: color 0.12s ease;
      }
      .cs-crumb-link:hover {
        color: var(--cs-text-primary);
      }
      .cs-crumb-current {
        color: var(--cs-text-primary);
        font-weight: 600;
      }
      .cs-sep {
        color: var(--cs-text-quaternary);
      }
    `,
  ],
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly breadcrumbs = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.buildBreadcrumbs(this.activatedRoute.root)),
    ),
    { initialValue: [] as Breadcrumb[] },
  );

  private buildBreadcrumbs(route: ActivatedRoute, url = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children = route.children;

    for (const child of children) {
      const routeUrl = child.snapshot.url.map((segment) => segment.path).join('/');
      if (routeUrl) {
        url += `/${routeUrl}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      if (label && breadcrumbs[breadcrumbs.length - 1]?.url !== url) {
        breadcrumbs.push({ label, url });
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
