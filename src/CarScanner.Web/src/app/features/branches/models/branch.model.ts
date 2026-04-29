import { BaseEntity } from '../../../core/models/base.model';

export interface Branch extends BaseEntity {
  name: string;
  city: string;
  address?: string;
  isActive: boolean;
}

export interface CreateBranchRequest {
  name: string;
  city: string;
  address?: string;
}

export interface UpdateBranchRequest {
  name: string;
  city: string;
  address?: string;
}

export interface CreateBranchResponse {
  branchId: string;
}
