export type Gender = "male" | "female" | "other";

export interface PatientListParams {
  skip?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export interface PatientListItem {
  id: number;
  full_name: string;
  medical_record_number: string | null;
  gender: Gender | null;
  date_of_birth: string | null;
  created_at: string;
  is_active: boolean;
}

export interface PatientListResponse {
  items: PatientListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PatientSummary extends PatientListItem {
  phone?: string | null;
  email?: string | null;
}

export interface PatientDetail extends PatientSummary {
  address?: string | null;
  notes?: string | null;
  updated_at: string | null;
  analyses: Array<{
    id: number;
    patient_id: number | null;
    mode: string;
    status: string;
    total_findings: number;
    dominant_label: string | null;
    dominant_category: string | null;
    summary: Record<string, unknown>;
    created_at: string;
    completed_at: string | null;
  }>;
}

export interface PatientCreateInput {
  full_name: string;
  medical_record_number?: string;
  date_of_birth?: string;
  gender?: Gender;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export type PatientUpdateInput = Partial<PatientCreateInput> & {
  is_active?: boolean;
};

