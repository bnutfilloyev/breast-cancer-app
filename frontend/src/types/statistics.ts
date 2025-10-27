export interface StatisticsResponse {
  total_patients: number;
  active_patients: number;
  total_analyses: number;
  completed_analyses: number;
  pending_analyses: number;
  processing_analyses: number;
  failed_analyses: number;
  total_findings: number;
}

export interface TrendResponse {
  labels: string[];
  analyses: number[];
  findings: number[];
}

export interface FindingsBreakdown {
  normal: number;
  benign: number;
  malignant: number;
}

