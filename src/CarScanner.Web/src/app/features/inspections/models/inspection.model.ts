import { BaseEntity } from '../../../core/models/base.model';

export enum InspectionType { Pickup = 0, Return = 1 }
export enum InspectionStatus { Pending = 0, InProgress = 1, PhotosUploaded = 2, Completed = 3 }
export enum PhotoPosition { Front = 0, Back = 1, LeftSide = 2, RightSide = 3 }

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = { [InspectionType.Pickup]: 'Pickup', [InspectionType.Return]: 'Return' };
export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = { [InspectionStatus.Pending]: 'Pending', [InspectionStatus.InProgress]: 'In Progress', [InspectionStatus.PhotosUploaded]: 'Photos Uploaded', [InspectionStatus.Completed]: 'Completed' };
export const PHOTO_POSITION_LABELS: Record<PhotoPosition, string> = { [PhotoPosition.Front]: 'Front', [PhotoPosition.Back]: 'Back', [PhotoPosition.LeftSide]: 'Left Side', [PhotoPosition.RightSide]: 'Right Side' };

export interface InspectionPhoto { id: string; inspectionId: string; position: PhotoPosition; photoUrl: string; takenAt: string; }

export interface VehicleInspection extends BaseEntity {
  rentalId: string; vehicleId: string; employeeId: string; inspectionType: InspectionType;
  status: InspectionStatus; completedAt?: string; notes?: string; photos: InspectionPhoto[];
}

export interface CreateInspectionRequest { rentalId: string; employeeId: string; inspectionType: InspectionType; }
export interface CreateInspectionResponse { inspectionId: string; }
export interface UploadPhotoResponse { photoId: string; photoUrl: string; }
export interface CompleteInspectionRequest { currentMileage: number; }
export interface CompleteInspectionResponse { inspectionId: string; isReturnInspection: boolean; }
