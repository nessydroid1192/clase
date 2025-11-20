import { EvaluationRecord } from '../types';

const STORAGE_KEY = 'logo_evaluations_db';

export const saveEvaluation = (record: Omit<EvaluationRecord, 'id' | 'timestamp'>): EvaluationRecord => {
  const existingData = getEvaluations();
  
  const newRecord: EvaluationRecord = {
    ...record,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };

  const updatedData = [newRecord, ...existingData];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  return newRecord;
};

export const getEvaluations = (): EvaluationRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteEvaluation = (id: string): EvaluationRecord[] => {
  const existingData = getEvaluations();
  const updatedData = existingData.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  return updatedData;
};

export const generateReportContent = (record: EvaluationRecord): string => {
  const date = new Date(record.timestamp).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
================================================
REPORTE DE EVALUACIÓN DE LOGOTIPO - 4º AÑO
================================================

DATOS DEL ESTUDIANTE
--------------------
Nombre:   ${record.studentName}
Paralelo: ${record.studentParallel}
Fecha:    ${date}

RESULTADO FINAL
---------------
Calificación: ${record.grade}

================================================
ANÁLISIS DETALLADO Y CORRECCIONES
================================================

${record.analysisText}
  `.trim();
};
