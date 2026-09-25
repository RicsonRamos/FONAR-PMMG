export interface ManifestFileInfo {
  sha256: string;
  size_bytes: number;
  mime_type: string;
}

export interface ManifestDocument {
  manifest_version: string;
  algorithm: string;
  protocol: string;
  evidence_id: string;
  generated_at_utc: string;
  system_version: string;
  files: {
    [filename: string]: ManifestFileInfo;
  };
  manifest_sha256?: string;
}

export interface EvidenceTransmissionPackage {
  protocol: string;
  evidence_id: string;
  session_id: string;
  generated_at_utc: string;
  json_filename: string;
  json_content: string;
  json_sha256: string;
  pdf_filename: string;
  pdf_base64: string;
  pdf_sha256: string;
  manifest_filename: string;
  manifest_content: string;
  manifest_sha256: string;
  snapshot_sha256: string;
}

export interface BackendResponse {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  protocol: string;
  evidence_id: string;
  timestamp_utc: string;
  drive_archived: boolean;
  drive_folder_id?: string;
  drive_folder_url?: string;
  email_sent: boolean;
  email_destination?: string;
  errors?: string[];
}
