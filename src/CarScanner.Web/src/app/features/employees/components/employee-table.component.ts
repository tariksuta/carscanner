import { Component, input, output } from '@angular/core';
import { Employee } from '../models/employee.model';

@Component({
  selector: 'app-employee-table',
  standalone: true,
  template: `
    <div class="rounded-md border border-border">
      <table class="w-full text-sm">
        <thead><tr class="border-b border-border bg-muted/50">
          <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
          <th class="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
          <th class="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
          <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
          <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
        </tr></thead>
        <tbody>
          @for (emp of employees(); track emp.id) {
            <tr class="border-b border-border hover:bg-muted/50">
              <td class="px-4 py-3 font-medium">{{ emp.firstName }} {{ emp.lastName }}</td>
              <td class="px-4 py-3">{{ emp.email }}</td>
              <td class="px-4 py-3">{{ emp.phone ?? '-' }}</td>
              <td class="px-4 py-3"><span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" [class]="emp.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'">{{ emp.isActive ? 'Active' : 'Inactive' }}</span></td>
              <td class="px-4 py-3 text-right"><button (click)="view.emit(emp.id)" class="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">View</button></td>
            </tr>
          } @empty { <tr><td colspan="5" class="px-4 py-8 text-center text-muted-foreground">No employees found</td></tr> }
        </tbody>
      </table>
    </div>
  `,
})
export class EmployeeTableComponent {
  employees = input.required<Employee[]>();
  view = output<string>();
}
