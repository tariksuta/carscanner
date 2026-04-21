import { BaseEntity } from '../../../core/models/base.model';

export interface Employee extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  applicationUserId?: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CreateEmployeeResponse {
  employeeId: string;
}
