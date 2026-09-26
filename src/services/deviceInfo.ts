export interface ClientNetworkInfo {
  ip: string;
  location: string;
  device: string;
}

/**
 * Detecta o tipo de dispositivo, sistema operacional e navegador a partir do User-Agent.
 */
export function detectDeviceSummary(userAgent: string): string {
  if (!userAgent) return 'Dispositivo Desconhecido';
  let device = 'Computador / Desktop';
  let os = 'Sistema Desconhecido';

  if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    if (/iPad|Tablet/i.test(userAgent)) {
      device = 'Tablet';
    } else {
      device = 'Celular / Smartphone';
    }
  }

  if (/Android/i.test(userAgent)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS (Apple)';
  else if (/Windows NT/i.test(userAgent)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(userAgent)) os = 'macOS';
  else if (/Linux/i.test(userAgent)) os = 'Linux';

  let browser = 'Navegador Web';
  if (/Chrome\//i.test(userAgent) && !/Edg/i.test(userAgent)) browser = 'Chrome';
  else if (/Edg\//i.test(userAgent)) browser = 'Edge';
  else if (/Safari\//i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = 'Safari';
  else if (/Firefox\//i.test(userAgent)) browser = 'Firefox';

  return `${device} (${os}) • ${browser}`;
}

/**
 * Resolução estritamente local e com Privacy by Design dos metadados técnicos.
 * Em conformidade com a LGPD e o princípio da minimização, NENHUMA requisição
 * a serviços terceiros de telemetria ou geolocalização externa (ex: ipwho.is, ipify.org)
 * é executada pelo navegador, prevenindo o rastreamento ou vazamento do IP da vítima.
 */
export async function fetchClientNetworkInfo(): Promise<ClientNetworkInfo> {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const device = detectDeviceSummary(userAgent);
  const defaultTz =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo (UTC-03:00)'
      : 'America/Sao_Paulo';

  return {
    ip: 'Privacidade Preservada (Sem telemetria externa)',
    location: defaultTz,
    device
  };
}
