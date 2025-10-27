export type AnalysisStatus = "pending" | "processing" | "completed" | "failed";

export interface AnalysisListParams {
  skip?: number;
  limit?: number;
  status?: AnalysisStatus;
  patient_id?: number;
}

export interface AnalysisSummary {
  id: number;
  patient_id: number | null;
  mode: string;
  status: AnalysisStatus;
  total_findings: number;
  dominant_label: string | null;
  dominant_category: string | null;
  summary: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
}

export interface AnalysisListResponse {
  items: AnalysisSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface AnalysisDetail extends AnalysisSummary {
  findings_description: string | null;
  recommendations: string | null;
  updated_at: string | null;
  images: AnalysisImage[];
}

export interface AnalysisUpdateInput {
  findings_description?: string | null;
  recommendations?: string | null;
  status?: AnalysisStatus;
  dominant_label?: string | null;
  dominant_category?: string | null;
  total_findings?: number;
}

export interface AnalysisImage {
  id: number;
  analysis_id: number;
  view_type: string;
  file_id: string;
  filename: string;
  original_filename: string;
  relative_path: string;
  thumbnail_path: string | null;
  file_size: number;
  width: number | null;
  height: number | null;
  detections_count: number;
  detections_data: Record<string, unknown> | null;
  created_at: string;
}

