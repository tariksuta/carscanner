export const environment = {
  production: false,
  apiUrl: 'https://localhost:7270/api',
  tenantId: '',
  // Manual FX rate for displaying USD ledger amounts in local currency.
  // Phase 7 (Stripe checkout) will replace this with provider-driven conversion.
  usdToBamRate: 1.78,
};
