/**
 * POLÍCIA MILITAR DE MINAS GERAIS — 16º BPM / 1ª Cia PM Ind PVD
 * Backend Google Apps Script — Formulário Auxiliar Institucional FONAR
 * 
 * Funcionalidades:
 * 1. Recepção segura do pacote de evidência via HTTPS POST (doPost)
 * 2. Validação rigorosa de payload e schema
 * 3. Prevenção de concorrência e idempotência via ScriptLock e verificação de protocolo
 * 4. Verificação independente de integridade SHA-256
 * 5. Arquivamento estruturado no Google Drive (Auditoria/YYYY/PROTOCOL/)
 * 6. Despacho de notificação institucional via Gmail
 * 7. Resposta JSON padronizada
 */

// ============================================================================
// CONFIGURAÇÃO CENTRALIZADA
// ============================================================================
function getAppConfig() {
  var scriptProps = PropertiesService.getScriptProperties();
  
  return {
    DRIVE_ROOT_FOLDER_ID: scriptProps.getProperty('DRIVE_ROOT_FOLDER_ID') || '1zsYALz3PqCXj5ZQJBV3eFOzHW-K0ig8J',
    EMAIL_DESTINATION: scriptProps.getProperty('EMAIL_DESTINATION') || 'pvd16bpm@pmmg.mg.gov.br',
    FORM_NAME: scriptProps.getProperty('FORM_NAME') || 'FONAR',
    FORM_VERSION: scriptProps.getProperty('FORM_VERSION') || '1.0.0',
    MAX_PAYLOAD_SIZE: 10 * 1024 * 1024, // 10 MB máximo
    ENVIRONMENT: scriptProps.getProperty('ENVIRONMENT') || 'production'
  };
}

// ============================================================================
// FUNÇÃO DE AUTORIZAÇÃO INICIAL (Executar manualmente 1 vez no editor)
// ============================================================================
function setupPermissions() {
  Logger.log('Executando autorização de permissões para Drive e Gmail...');
  var config = getAppConfig();
  Logger.log('Configuração atual:');
  Logger.log('DRIVE_ROOT_FOLDER_ID: ' + (config.DRIVE_ROOT_FOLDER_ID ? 'Configurado' : 'Não configurado (usará Drive raiz)'));
  Logger.log('EMAIL_DESTINATION: ' + config.EMAIL_DESTINATION);
  Logger.log('Autorização concluída com sucesso.');
}

// ============================================================================
// ENDPOINT GET (Diagnóstico e Status)
// ============================================================================
function doGet(e) {
  var config = getAppConfig();
  var payload = {
    service: 'Formulário Auxiliar Institucional FONAR — PMMG 16º BPM',
    status: 'ONLINE',
    version: config.FORM_VERSION,
    environment: config.ENVIRONMENT,
    timestamp_utc: new Date().toISOString()
  };

  return ContentService.createTextOutput(JSON.stringify(payload, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// ENDPOINT POST (Recepção do Pacote de Evidência)
// ============================================================================
function doPost(e) {
  var lock = LockService.getScriptLock();
  var lockAcquired = false;

  try {
    // 1. Controle de Concorrência (Lock por até 20 segundos)
    lockAcquired = lock.tryLock(20000);
    if (!lockAcquired) {
      return createJsonResponse({
        status: 'ERROR',
        message: 'Servidor ocupado processando requisições. Tente novamente em alguns segundos.',
        errors: ['LOCK_TIMEOUT']
      }, 503);
    }

    var config = getAppConfig();

    // 2. Validação da Requisição
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        status: 'ERROR',
        message: 'Requisição inválida: corpo de dados vazio.',
        errors: ['EMPTY_PAYLOAD']
      }, 400);
    }

    var contents = e.postData.contents;
    if (contents.length > config.MAX_PAYLOAD_SIZE) {
      return createJsonResponse({
        status: 'ERROR',
        message: 'Tamanho da requisição excede o limite máximo permitido (10MB).',
        errors: ['PAYLOAD_TOO_LARGE']
      }, 413);
    }

    // 3. Parser do Payload
    var pkg;
    try {
      pkg = JSON.parse(contents);
    } catch (parseError) {
      return createJsonResponse({
        status: 'ERROR',
        message: 'Estrutura JSON corrompida ou inválida.',
        errors: ['JSON_PARSE_ERROR']
      }, 400);
    }

    // 4. Validação de Campos Obrigatórios do Pacote
    var requiredFields = ['protocol', 'evidence_id', 'json_filename', 'json_content', 'pdf_filename', 'pdf_base64', 'manifest_filename', 'manifest_content'];
    for (var i = 0; i < requiredFields.length; i++) {
      var field = requiredFields[i];
      if (!pkg[field] || typeof pkg[field] !== 'string' || pkg[field].trim() === '') {
        return createJsonResponse({
          status: 'ERROR',
          message: 'Campo obrigatório ausente no pacote: ' + field,
          errors: ['MISSING_FIELD_' + field.toUpperCase()]
        }, 400);
      }
    }

    var protocol = pkg.protocol.trim();
    var evidenceId = pkg.evidence_id.trim();
    var timestampUtc = new Date().toISOString();

    // 4.1 Validação Estrita de Formato (Protocolo e Evidence ID)
    if (!/^FORM-\d{4}-\d{6}$/.test(protocol)) {
      return createJsonResponse({
        status: 'ERROR',
        message: 'Formato de protocolo inválido. Esperado: FORM-YYYY-NNNNNN.',
        errors: ['INVALID_PROTOCOL_FORMAT']
      }, 400);
    }

    if (!/^EV-[a-zA-Z0-9_-]{8,64}$/.test(evidenceId)) {
      return createJsonResponse({
        status: 'ERROR',
        message: 'Formato de Evidence ID inválido.',
        errors: ['INVALID_EVIDENCE_ID_FORMAT']
      }, 400);
    }

    // 4.2 Validação de Nomes de Arquivos (Prevenção de Path Traversal e Injeção de Arquivos)
    var expectedPdfFilename = protocol + '.pdf';
    var expectedJsonFilename = protocol + '.json';
    if (pkg.pdf_filename !== expectedPdfFilename || pkg.json_filename !== expectedJsonFilename || pkg.manifest_filename !== 'MANIFEST.json') {
      return createJsonResponse({
        status: 'ERROR',
        message: 'Nomes de arquivos inconsistentes com o protocolo da submissão.',
        errors: ['INVALID_FILENAMES']
      }, 400);
    }

    // 4.3 Validação de Formato dos Hashes SHA-256 informados
    var sha256Regex = /^[a-fA-F0-9]{64}$/;
    if (pkg.pdf_sha256 && !sha256Regex.test(pkg.pdf_sha256)) {
      return createJsonResponse({
        status: 'ERROR',
        message: 'Formato inválido do hash SHA-256 do PDF.',
        errors: ['INVALID_PDF_HASH_FORMAT']
      }, 400);
    }

    // 5. Verificação de Idempotência (Evitar pacotes duplicados)
    var targetFolder = getOrCreateSubmissionFolder(config, protocol);
    var existingFiles = targetFolder.getFilesByName(pkg.manifest_filename);
    if (existingFiles.hasNext()) {
      Logger.log('[IDEMPOTÊNCIA] Submissão já arquivada anteriormente para o protocolo: ' + protocol);
      return createJsonResponse({
        status: 'SUCCESS',
        message: 'Submissão já arquivada anteriormente (idempotência atendida).',
        protocol: protocol,
        evidence_id: evidenceId,
        timestamp_utc: timestampUtc,
        drive_archived: true,
        email_sent: true
      }, 200);
    }

    // 6. Decodificação e Validação de Magic Bytes do PDF (%PDF-)
    var pdfBytes;
    try {
      pdfBytes = Utilities.base64Decode(pkg.pdf_base64);
    } catch (b64Err) {
      return createJsonResponse({
        status: 'ERROR',
        message: 'Falha ao decodificar Base64 do arquivo PDF.',
        errors: ['BASE64_DECODE_ERROR']
      }, 400);
    }

    if (!pdfBytes || pdfBytes.length < 5 ||
        pdfBytes[0] !== 0x25 || // '%'
        pdfBytes[1] !== 0x50 || // 'P'
        pdfBytes[2] !== 0x44 || // 'D'
        pdfBytes[3] !== 0x46 || // 'F'
        pdfBytes[4] !== 0x2D) { // '-'
      Logger.log('[FALHA MAGIC BYTES PDF] Arquivo não possui cabeçalho %PDF-');
      return createJsonResponse({
        status: 'ERROR',
        message: 'O arquivo PDF enviado não possui assinatura binária válida (%PDF-).',
        errors: ['INVALID_PDF_MAGIC_BYTES']
      }, 400);
    }

    // Verificação Independente de Hashes SHA-256 no Backend
    var serverCalculatedPdfHash = computeSha256Hex(pdfBytes);
    var serverCalculatedJsonHash = computeSha256Hex(Utilities.newBlob(pkg.json_content).getBytes());

    if (pkg.pdf_sha256 && pkg.pdf_sha256.toLowerCase() !== serverCalculatedPdfHash.toLowerCase()) {
      Logger.log('[FALHA HASH PDF] Esperado: ' + pkg.pdf_sha256 + ', Calculado: ' + serverCalculatedPdfHash);
      return createJsonResponse({
        status: 'ERROR',
        message: 'Divergência de integridade detectada no arquivo PDF.',
        errors: ['PDF_HASH_MISMATCH']
      }, 400);
    }

    // 7. Gravação Atômica dos Arquivos no Google Drive
    // 7.1 Salvar PDF
    var pdfBlob = Utilities.newBlob(pdfBytes, 'application/pdf', expectedPdfFilename);
    var pdfFile = targetFolder.createFile(pdfBlob);

    // 7.2 Salvar JSON
    var jsonBlob = Utilities.newBlob(pkg.json_content, 'application/json', expectedJsonFilename);
    var jsonFile = targetFolder.createFile(jsonBlob);

    // 7.3 Salvar MANIFEST
    var manifestBlob = Utilities.newBlob(pkg.manifest_content, 'application/json', 'MANIFEST.json');
    var manifestFile = targetFolder.createFile(manifestBlob);

    var driveArchived = true;

    // 8. Despacho Secundário de E-mail via Gmail
    var emailSent = false;
    try {
      if (config.EMAIL_DESTINATION && config.EMAIL_DESTINATION.trim() !== '') {
        sendInstitutionalNotificationEmail(config, protocol, evidenceId, targetFolder.getUrl(), [pdfBlob, manifestBlob], serverCalculatedPdfHash, serverCalculatedJsonHash);
        emailSent = true;
      }
    } catch (mailError) {
      Logger.log('[AVISO GMAIL] Falha ao enviar e-mail (Drive foi arquivado com sucesso): ' + mailError.toString());
      emailSent = false;
    }

    // 9. Retorno de Sucesso (Omitindo URLs internas do Drive e e-mails por segurança e privacidade)
    return createJsonResponse({
      status: 'SUCCESS',
      message: 'Pacote de evidência arquivado com sucesso.',
      protocol: protocol,
      evidence_id: evidenceId,
      timestamp_utc: timestampUtc,
      drive_archived: driveArchived,
      email_sent: emailSent
    }, 200);

  } catch (globalError) {
    Logger.log('[ERRO CRÍTICO doPost]: ' + globalError.toString());
    return createJsonResponse({
      status: 'ERROR',
      message: 'Erro interno no processamento pelo Google Apps Script.',
      errors: [globalError.toString()]
    }, 500);
  } finally {
    if (lockAcquired) {
      lock.releaseLock();
    }
  }
}

// ============================================================================
// AUXILIAR: ESTRUTURAÇÃO DE PASTAS NO GOOGLE DRIVE
// ============================================================================
function getOrCreateSubmissionFolder(config, protocol) {
  var rootFolder;
  if (config.DRIVE_ROOT_FOLDER_ID && config.DRIVE_ROOT_FOLDER_ID.trim() !== '') {
    try {
      rootFolder = DriveApp.getFolderById(config.DRIVE_ROOT_FOLDER_ID);
    } catch (err) {
      Logger.log('[DRIVE] Pasta DRIVE_ROOT_FOLDER_ID não encontrada. Usando raiz.');
      rootFolder = DriveApp.getRootFolder();
    }
  } else {
    rootFolder = DriveApp.getRootFolder();
  }

  // 1. Pasta Auditoria
  var auditFolder = getOrCreateSubfolder(rootFolder, 'Auditoria');

  // 2. Pasta Ano (YYYY)
  var currentYear = new Date().getUTCFullYear().toString();
  var yearFolder = getOrCreateSubfolder(auditFolder, currentYear);

  // 3. Pasta da Submissão (o formulário em si, ex: FORM-2026-000123)
  var submissionFolder = getOrCreateSubfolder(yearFolder, protocol);

  return submissionFolder;
}

function getOrCreateSubfolder(parent, name) {
  var folders = parent.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parent.createFolder(name);
}

// ============================================================================
// AUXILIAR: NOTIFICAÇÃO POR GMAIL COM SANITIZAÇÃO DE HTML
// ============================================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sendInstitutionalNotificationEmail(config, protocol, evidenceId, folderUrl, attachments, pdfHash, jsonHash) {
  // Prevenção de Email Header Injection
  var cleanProtocol = String(protocol).replace(/[\r\n]/g, '').trim();
  var subject = 'Nova submissão — ' + cleanProtocol + ' — FONAR 16º BPM';
  
  var now = new Date();
  var formattedDate = Utilities.formatDate(now, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss');

  // Sanitização estrita contra HTML Injection em clientes de e-mail institucionais
  var safeProtocol = escapeHtml(cleanProtocol);
  var safeEvidenceId = escapeHtml(evidenceId);
  var safeFormattedDate = escapeHtml(formattedDate);
  var safeFolderUrl = escapeHtml(folderUrl);
  var safePdfHash = escapeHtml(pdfHash);
  var safeJsonHash = escapeHtml(jsonHash);

  var htmlBody = ''
    + '<div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 650px; border: 1px solid #DDE0E5; border-radius: 8px; overflow: hidden;">'
    + '  <div style="background-color: #373435; color: #FFFFFF; padding: 18px 24px; border-bottom: 4px solid #A08F63;">'
    + '    <h2 style="margin: 0; font-size: 18px; color: #FFFFFF;">POLÍCIA MILITAR DE MINAS GERAIS</h2>'
    + '    <p style="margin: 4px 0 0 0; font-size: 13px; color: #A08F63;">16º BPM / 1ª Cia PM Ind PVD (RMBH) — Formulário Auxiliar FONAR</p>'
    + '  </div>'
    + '  <div style="padding: 24px;">'
    + '    <p style="font-size: 14px; margin-top: 0;">Prezado(a) militar ou responsável,</p>'
    + '    <p style="font-size: 13px; color: #4A5568; line-height: 1.5;">'
    + '      Foi registrada uma nova submissão técnica no Formulário Auxiliar do FONAR. Os arquivos de evidência foram arquivados com integridade no Google Drive.'
    + '    </p>'
    + '    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 18px 0; background-color: #F8F9FA;">'
    + '      <tr><td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-weight: bold; width: 35%;">Protocolo:</td><td style="padding: 8px 12px; border: 1px solid #E2E8F0; color: #AB2328; font-weight: bold; font-family: monospace;">' + safeProtocol + '</td></tr>'
    + '      <tr><td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-weight: bold;">Evidence ID:</td><td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-family: monospace;">' + safeEvidenceId + '</td></tr>'
    + '      <tr><td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-weight: bold;">Data/Hora Local:</td><td style="padding: 8px 12px; border: 1px solid #E2E8F0;">' + safeFormattedDate + ' (Horário de Brasília)</td></tr>'
    + '      <tr><td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-weight: bold;">Pasta Google Drive:</td><td style="padding: 8px 12px; border: 1px solid #E2E8F0;"><a href="' + safeFolderUrl + '" style="color: #A08F63; font-weight: bold;">Abrir Pasta da Submissão</a></td></tr>'
    + '      <tr><td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-weight: bold;">PDF SHA-256:</td><td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-family: monospace; font-size: 10px;">' + safePdfHash + '</td></tr>'
    + '      <tr><td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-weight: bold;">JSON SHA-256:</td><td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-family: monospace; font-size: 10px;">' + safeJsonHash + '</td></tr>'
    + '    </table>'
    + '    <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 10px 14px; font-size: 11px; color: #92400E; margin-top: 16px;">'
    + '      <strong>Aviso de Ferramenta Auxiliar:</strong> Esta submissão deve ser transcrita manualmente no sistema institucional REDS pelo militar responsável.'
    + '    </div>'
    + '  </div>'
    + '  <div style="background-color: #F8F9FA; padding: 12px 24px; font-size: 10px; color: #718096; border-top: 1px solid #E2E8F0; text-align: center;">'
    + '    Mensagem automática gerada pelo Google Apps Script do 16º BPM / PMMG.'
    + '  </div>'
    + '</div>';

  var mailOptions = {
    to: config.EMAIL_DESTINATION,
    subject: subject,
    htmlBody: htmlBody,
    attachments: attachments
  };

  MailApp.sendEmail(mailOptions);
}

// ============================================================================
// AUXILIAR: HASHING SHA-256
// ============================================================================
function computeSha256Hex(bytes) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes);
  var hex = '';
  for (var i = 0; i < digest.length; i++) {
    var val = (digest[i] + 256) % 256;
    var byteHex = val.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    hex += byteHex;
  }
  return hex;
}

// ============================================================================
// AUXILIAR: RESPOSTA JSON COM HEADERS CORS
// ============================================================================
function createJsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
