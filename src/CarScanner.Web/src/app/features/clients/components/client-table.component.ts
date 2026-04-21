import { Component, input, output } from '@angular/core';
import { Client } from '../models/client.model';

@Component({
  selector: 'app-client-table',
  standalone: true,
  template: `
    <div class="rounded-md border border-border">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">License</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (client of clients(); track client.id) {
            <tr class="border-b border-border transition-colors hover:bg-muted/50">
              <td class="px-4 py-3 font-medium">{{ client.firstName }} {{ client.lastName }}</td>
              <td class="px-4 py-3">{{ client.email }}</td>
              <td class="px-4 py-3">{{ client.phone }}</td>
              <td class="px-4 py-3">{{ client.driverLicenseNumber }}</td>
              <td class="px-4 py-3 text-right">
                <button
                  (click)="view.emit(client.id)"
                  class="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  View
                </button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="5" class="px-4 py-8 text-center text-muted-foreground">
                No clients found
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ClientTableComponent {
  clients = input.required<Client[]>();
  view = output<string>();
}
