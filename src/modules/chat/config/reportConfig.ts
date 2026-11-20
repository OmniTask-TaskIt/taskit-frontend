import { env } from '../../authentication/Config/env';

const normalizedBase = env.reportApiUrl.trim().replace(/\/+$/, '');

export const REPORT_API_BASE = normalizedBase ? `${normalizedBase}/api/v1` : '';
export const REPORT_CONFIG_ERROR = 'VITE_REPORT_API_URL no está configurada. Configura la URL del microservicio de reportes.';

