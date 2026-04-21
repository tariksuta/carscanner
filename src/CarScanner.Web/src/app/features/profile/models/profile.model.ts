export interface UserProfile {
  email: string;
  firstName?: string;
  lastName?: string;
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  profileImageUrl?: string;
}

export interface UploadProfileImageResponse {
  imageUrl: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
