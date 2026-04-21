export interface ApiError {
  code: string;
  description: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  value?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
