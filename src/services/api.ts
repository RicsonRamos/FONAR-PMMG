import { BackendResponse, EvidenceTransmissionPackage } from '../types/evidence';

// URL configurada via variável de ambiente Vite
const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';

/**
 * Envia o pacote de evidência técnica para o Google Apps Script.
 */
export async function transmitEvidencePackage(
  pkg: EvidenceTransmissionPackage
): Promise<BackendResponse> {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.trim() === '' || APPS_SCRIPT_URL.includes('SEU_GOOGLE_APPS_SCRIPT_URL')) {
    // Modo de demonstração / teste local se nenhuma URL estiver configurada ainda
    console.warn(
      '[FONAR API] VITE_GOOGLE_APPS_SCRIPT_URL não configurada. Simulando resposta de sucesso para teste local.'
    );
    await new Promise(r => setTimeout(r, 1200));
    return {
      status: 'SUCCESS',
      message: 'Submissão processada com sucesso (Simulação Local - Configure a URL do Apps Script no .env)',
      protocol: pkg.protocol,
      evidence_id: pkg.evidence_id,
      timestamp_utc: new Date().toISOString(),
      drive_archived: true,
      drive_folder_id: 'mock-folder-id-16bpm',
      drive_folder_url: 'https://drive.google.com/drive/folders/mock',
      email_sent: true,
      email_destination: 'pvd16bpm@pmmg.mg.gov.br'
    };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' // Text/plain evita preflight CORS desnecessário no Apps Script
      },
      body: JSON.stringify(pkg),
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta do servidor (HTTP ${response.status})`);
    }

    const result: BackendResponse = await response.json();

    if (result.status !== 'SUCCESS') {
      throw new Error(result.message || 'Falha no processamento pelo Google Apps Script');
    }

    return result;
  } catch (error) {
    console.error('[FONAR API] Falha na transmissão:', error);
    throw new Error('Não foi possível concluir o envio. Verifique sua conexão e tente novamente.');
  }
}
