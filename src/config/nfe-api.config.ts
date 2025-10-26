export const NFE_API_CONFIG = {
  BASE_URL: process.env.NFE_API_URL || 'http://localhost:8080/api',
  TIMEOUT: parseInt(process.env.NFE_API_TIMEOUT || '30000'),
  RETRY_ATTEMPTS: parseInt(process.env.NFE_API_RETRY_ATTEMPTS || '3'),
  RETRY_DELAY: parseInt(process.env.NFE_API_RETRY_DELAY || '1000'),
  WEBHOOK_SECRET: process.env.NFE_WEBHOOK_SECRET || 'default-webhook-secret',
  SYNC_INTERVAL: parseInt(process.env.NFE_SYNC_INTERVAL || '120000'), // 2 minutos
};

export const NFE_API_ENDPOINTS = {
  EMITIR: '/v1/nfe/emitir',
  STATUS: '/v1/nfe/status',
  CANCELAR: '/v1/nfe/cancelar',
  INUTILIZAR: '/v1/nfe/inutilizar',
  CONSULTAR: '/v1/nfe/consultar',
};

export const NFE_API_HEADERS = {
  CONTENT_TYPE: 'application/json',
  ACCEPT: 'application/json',
  USER_AGENT: 'Fenix-NFe-Integration/1.0',
};
