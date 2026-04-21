export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}
