export const APP_CONSTANTS = {
  APP_NAME: 'CarScanner',
  DATE_FORMAT: 'dd.MM.yyyy',
  DATETIME_FORMAT: 'dd.MM.yyyy HH:mm',
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
  },
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    TENANT_ID: 'tenant_id',
  },
} as const;
