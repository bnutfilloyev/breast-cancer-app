export interface SearchResultPatient {
  id: number;
  full_name: string;
  medical_record_number: string | null;
  created_at: string;
}

export interface SearchResultAnalysis {
  id: number;
  patient_id: number | null;
  mode: string;
  status: string;
  total_findings: number;
  dominant_label: string | null;
  dominant_category: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface GlobalSearchResponse {
  patients: SearchResultPatient[];
  analyses: SearchResultAnalysis[];
}

