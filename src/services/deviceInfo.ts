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
 * Consulta segura e com timeout para obter IP e Localização aproximada.
 * Possui fallback gracioso para nunca travar ou atrasar a submissão.
 */
export async function fetchClientNetworkInfo(): Promise<ClientNetworkInfo> {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const device = detectDeviceSummary(userAgent);
  const defaultTz =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo (UTC-03:00)'
      : 'America/Sao_Paulo';

  // Tentativa 1: ipwho.is (CORS aberto, rápido e sem chave de API)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const resp = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (resp.ok) {
      const data = await resp.json();
      if (data.success !== false) {
        const locParts = [data.city, data.region, data.country].filter(Boolean);
        return {
          ip: data.ip || 'Não detectado',
          location: locParts.join(', ') || defaultTz,
          device
        };
      }
    }
  } catch {
    // Prossegue para o próximo fallback
  }

  // Tentativa 2: api.ipify.org
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const resp = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (resp.ok) {
      const data = await resp.json();
      return {
        ip: data.ip || 'Não detectado',
        location: defaultTz,
        device
      };
    }
  } catch {
    // Falha silenciosa
  }

  return {
    ip: 'Não disponível no cliente (registro no servidor)',
    location: defaultTz,
    device
  };
}
