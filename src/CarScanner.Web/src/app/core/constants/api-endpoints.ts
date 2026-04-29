export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
  },
  VEHICLES: {
    BASE: '/vehicles',
    BY_ID: (id: string) => `/vehicles/${id}`,
    IMAGES: (vehicleId: string) => `/vehicles/${vehicleId}/images`,
    IMAGE: (vehicleId: string, imageId: string) => `/vehicles/${vehicleId}/images/${imageId}`,
    SET_PRIMARY: (vehicleId: string, imageId: string) => `/vehicles/${vehicleId}/images/${imageId}/primary`,
  },
  CLIENTS: {
    BASE: '/clients',
    BY_ID: (id: string) => `/clients/${id}`,
    DETAILS: (id: string) => `/clients/${id}/details`,
  },
  EMPLOYEES: {
    BASE: '/employees',
    BY_ID: (id: string) => `/employees/${id}`,
    LOGIN_ACCESS: (id: string) => `/employees/${id}/login-account`,
    PERMISSIONS: (id: string) => `/employees/${id}/permissions`,
    STATS: (id: string) => `/employees/${id}/stats`,
    RECENT_INSPECTIONS: (id: string) => `/employees/${id}/recent-inspections`,
  },
  BRANCHES: {
    BASE: '/branches',
    BY_ID: (id: string) => `/branches/${id}`,
    ACTIVATE: (id: string) => `/branches/${id}/activate`,
    DEACTIVATE: (id: string) => `/branches/${id}/deactivate`,
  },
  RENTALS: {
    BASE: '/rentals',
    BY_ID: (id: string) => `/rentals/${id}`,
    CHANGE_STATUS: (id: string) => `/rentals/${id}/status`,
  },
  INSPECTIONS: {
    BASE: '/inspections',
    BY_ID: (id: string) => `/inspections/${id}`,
    PHOTOS: (inspectionId: string) => `/inspections/${inspectionId}/photos`,
    COMPLETE: (inspectionId: string) => `/inspections/${inspectionId}/complete`,
  },
  DAMAGE_REPORTS: {
    BASE: '/damage-reports',
    BY_ID: (id: string) => `/damage-reports/${id}`,
    ANALYZE: (reportId: string) => `/damage-reports/${reportId}/analyze`,
  },
  PROFILE: {
    BASE: '/profile',
    PASSWORD: '/profile/password',
    IMAGE: '/profile/image',
  },
} as const;
