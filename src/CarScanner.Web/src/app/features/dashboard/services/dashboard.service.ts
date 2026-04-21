import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { DashboardStats } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  getStats(): Observable<DashboardStats> {
    return this.api.get<{ vehicles: { status: number }[] }>(API_ENDPOINTS.VEHICLES.BASE).pipe(
      map((result) => {
        const vehicles = result.vehicles ?? [];
        return {
          totalVehicles: vehicles.length,
          availableVehicles: vehicles.filter((v) => v.status === 0).length,
          activeRentals: vehicles.filter((v) => v.status === 1).length,
          pendingInspections: 0,
        };
      }),
    );
  }
}
