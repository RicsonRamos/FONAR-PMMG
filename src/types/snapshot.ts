export interface FrozenQuestion {
  question_id: string;
  question_version: string;
  section_id: string;
  text: string;
  type: string;
  options: string[];
  answer: string | string[];
}

export interface FrozenNotice {
  id: string;
  version: string;
  text: string;
  sha256: string;
}

export interface FrozenDeclaration {
  version: string;
  text: string;
  confirmed: boolean;
  confirmed_at_utc: string;
  sha256: string;
}

export interface TechnicalMetadata {
  user_agent: string;
  language: string;
  screen_resolution: string;
  timezone: string;
  timezone_offset_minutes: number;
}

export interface AuditEvent {
  timestamp_utc: string;
  event_type: string;
  protocol: string;
  session_id: string;
  previous_hash: string;
  event_hash: string;
  details?: Record<string, unknown>;
}

export interface SubmissionSnapshot {
  evidence_id: string;
  protocol: string;
  session_id: string;
  system: {
    name: string;
    version: string;
    build_id: string;
    build_timestamp: string;
  };
  form: {
    id: string;
    version: string;
    title: string;
  };
  timestamps: {
    submitted_at_utc: string;
    submitted_at_local: string;
  };
  notices: FrozenNotice[];
  declaration: FrozenDeclaration;
  technical: TechnicalMetadata;
  questions: FrozenQuestion[];
  audit_trail: {
    algorithm: string;
    events: AuditEvent[];
    final_chain_hash: string;
  };
}

export interface CanonicalSubmissionJson extends SubmissionSnapshot {
  schema_version: string;
  hashes: {
    snapshot_sha256: string;
    canonical_json_sha256: string;
    pdf_sha256: string;
    audit_trail_sha256: string;
  };
}
