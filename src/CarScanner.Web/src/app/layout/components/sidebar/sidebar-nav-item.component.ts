import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NavItem } from './sidebar.config';

@Component({
  selector: 'app-sidebar-nav-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [routerLink]="item().route"
      routerLinkActive="active"
      class="cs-nav-item"
      [class.collapsed]="collapsed()"
      [title]="collapsed() ? item().label : null"
    >
      <span class="cs-nav-item-accent"></span>
      <lucide-icon [name]="item().icon" [size]="18" class="cs-nav-icon" />
      @if (!collapsed()) {
        <span class="cs-nav-label">{{ item().label }}</span>
      }
    </a>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .cs-nav-item {
        position: relative;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 9px 12px;
        border-radius: 10px;
        color: var(--cs-text-secondary);
        font-size: 13px;
        font-weight: 500;
        text-decoration: none;
        transition: background 0.12s ease, color 0.12s ease;
      }
      .cs-nav-item.collapsed {
        justify-content: center;
      }
      .cs-nav-icon {
        color: var(--cs-text-tertiary);
        flex-shrink: 0;
      }
      .cs-nav-item:hover {
        background: var(--cs-bg-2);
        color: var(--cs-text-primary);
      }
      .cs-nav-item:hover .cs-nav-icon {
        color: var(--cs-text-primary);
      }
      .cs-nav-item.active {
        background: var(--cs-accent-soft);
        color: var(--cs-text-primary);
      }
      .cs-nav-item.active .cs-nav-icon {
        color: var(--cs-accent);
      }
      .cs-nav-item-accent {
        position: absolute;
        left: 0;
        top: 8px;
        bottom: 8px;
        width: 3px;
        border-radius: 0 3px 3px 0;
        background: transparent;
      }
      .cs-nav-item.active .cs-nav-item-accent {
        background: var(--cs-accent);
      }
      .cs-nav-label {
        white-space: nowrap;
      }
    `,
  ],
})
export class SidebarNavItemComponent {
  readonly item = input.required<NavItem>();
  readonly collapsed = input<boolean>(false);
}
