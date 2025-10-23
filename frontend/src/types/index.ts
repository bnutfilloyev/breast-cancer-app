export interface Patient {
  id: number
  full_name: string
  medical_record_number?: string | null
  date_of_birth?: string | null
  gender?: 'male' | 'female' | 'other' | null
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
  is_active: boolean
  created_at: string
  updated_at?: string | null
  analyses?: Analysis[]
}

export interface Analysis {
  id: number
  patient_id?: number | null
  mode: 'multi' | 'single'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_findings: number
  dominant_label?: string | null
  dominant_category?: 'normal' | 'benign' | 'malignant' | null
  summary: Record<string, any>
  findings_description?: string | null
  recommendations?: string | null
  created_at: string
  updated_at?: string | null
  completed_at?: string | null
  images?: AnalysisImage[]
}

export interface AnalysisImage {
  id: number
  analysis_id: number
  view_type: 'top' | 'bottom' | 'left' | 'right' | 'single' | 'other'
  file_id: string
  filename: string
  original_filename: string
  relative_path: string
  thumbnail_path?: string | null
  file_size: number
  width?: number | null
  height?: number | null
  detections_count: number
  detections_data?: any
  created_at: string
}

export interface Detection {
  bbox: BoundingBox
  confidence: number
  label: string
  category: 'normal' | 'benign' | 'malignant'
  traffic_light: 'green' | 'amber' | 'red'
}

export interface BoundingBox {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface ViewPrediction {
  size: {
    width: number
    height: number
  }
  detections: Detection[]
}

export interface InferenceResponse {
  mode: 'multi' | 'single'
  views: Record<string, ViewPrediction>
  model: ModelInfo
  analysis_id?: number | null
}

export interface ModelInfo {
  name: string
  weights: string
  device: string
  confidence_threshold: number
  iou_threshold?: number | null
  augmentation: boolean
  classes: Record<number, string>
  categories: Record<number, 'normal' | 'benign' | 'malignant'>
}

export interface Statistics {
  total_patients: number
  active_patients: number
  total_analyses: number
  completed_analyses: number
  total_findings: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages?: number
}

export interface PatientFormData {
  full_name: string
  medical_record_number?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  phone?: string
  email?: string
  address?: string
  notes?: string
}

export interface AnalysisFormData {
  findings_description?: string
  recommendations?: string
}
