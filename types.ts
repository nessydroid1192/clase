export interface AnalysisResult {
  markdown: string;
}

export interface FileInputState {
  file: File | null;
  previewUrl: string | null;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface EvaluationRecord {
  id: string;
  studentName: string;
  studentParallel: string;
  timestamp: number;
  grade: string; // Extracted grade (e.g., "85/100")
  analysisText: string;
}
