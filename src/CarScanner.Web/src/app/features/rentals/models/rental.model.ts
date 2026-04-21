import { BaseEntity } from '../../../core/models/base.model';

export enum RentalStatus { Pending = 0, PickupInProgress = 1, Active = 2, ReturnInProgress = 3, Completed = 4, Cancelled = 5 }

export const RENTAL_STATUS_LABELS: Record<RentalStatus, string> = {
  [RentalStatus.Pending]: 'Pending', [RentalStatus.PickupInProgress]: 'Pickup In Progress', [RentalStatus.Active]: 'Active',
  [RentalStatus.ReturnInProgress]: 'Return In Progress', [RentalStatus.Completed]: 'Completed', [RentalStatus.Cancelled]: 'Cancelled',
};

export interface Rental extends BaseEntity {
  vehicleId: string; clientId: string; pickupEmployeeId?: string; returnEmployeeId?: string;
  pickupInspectionId?: string; returnInspectionId?: string; pickupDate?: string;
  expectedReturnDate: string; actualReturnDate?: string; pickupMileage?: number;
  returnMileage?: number; status: RentalStatus; notes?: string;
}

export interface CreateRentalRequest { vehicleId: string; clientId: string; expectedReturnDate: string; notes?: string; }
export interface CreateRentalResponse { rentalId: string; }
