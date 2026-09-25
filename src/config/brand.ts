/**
 * Manual de Identidade Visual da PMMG (MIV/PMMG/2025)
 * Diretrizes institucionais de cores e tipografia.
 */
export const PMMG_BRAND = {
  name: 'Polícia Militar de Minas Gerais',
  unit: '16º Batalhão de Polícia Militar — 16º BPM',
  subUnit: '1ª Cia PM Ind PVD (RMBH)',
  program: 'Patrulha de Prevenção à Violência Doméstica (PPVD)',
  colors: {
    // Cores oficiais MIV PMMG 2025
    black: '#373435',       // PMS Black (#373435 / RGB: 55, 52, 53) - Autoridade e sobriedade
    gold: '#A08F63',        // PMS 4515C (#A08F63 / RGB: 160, 143, 99) - Cáqui / Ouro militar
    goldLight: '#B3A369',
    goldDark: '#847550',
    red: '#AB2328',         // PMS 7621C (#AB2328 / RGB: 189, 53, 57) - Detalhes e Inconfidência
    redDark: '#8E1C20',
    bg: '#F4F5F7',          // Fundo suave de trabalho
    surface: '#FFFFFF',     // Superfície de cartões
    border: '#DDE0E5',      // Bordas limpas
    text: '#1F2421',        // Texto principal
    muted: '#5F6368'        // Texto secundário
  },
  typography: {
    display: 'Teko, Impact, sans-serif',
    body: 'Rawline, Arial, -apple-system, sans-serif'
  }
} as const;
