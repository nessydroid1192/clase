import React, { useState, useEffect } from 'react';
import CompositionBackground from './components/CompositionBackground';
import LogoUploader from './components/LogoUploader';
import AnalysisDisplay from './components/AnalysisDisplay';
import { analyzeLogo, fileToBase64 } from './services/geminiService';
import { saveEvaluation, getEvaluations, deleteEvaluation, generateReportContent } from './services/storageService';
import { AnalysisStatus, FileInputState, EvaluationRecord } from './types';

function App() {
  // State for input form
  const [studentName, setStudentName] = useState('');
  const [studentParallel, setStudentParallel] = useState('');
  const [fileState, setFileState] = useState<FileInputState>({ file: null, previewUrl: null });
  const [context, setContext] = useState('');
  
  // State for analysis
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // State for "Database"
  const [dbRecords, setDbRecords] = useState<EvaluationRecord[]>([]);

  // Load records on mount
  useEffect(() => {
    setDbRecords(getEvaluations());
  }, []);

  const handleFileSelect = (file: File, previewUrl: string) => {
    setFileState({ file, previewUrl });
    setStatus(AnalysisStatus.IDLE);
    setResult('');
    setError(null);
  };

  const handleClear = () => {
    setFileState({ file: null, previewUrl: null });
    setStatus(AnalysisStatus.IDLE);
    setResult('');
    setContext('');
  };

  // Extract grade from the AI text response using Regex
  const extractGrade = (text: string): string => {
    const regex = /CALIFICACIÓN FINAL:\s*(\d{1,3}\/100)/i;
    const match = text.match(regex);
    return match ? match[1] : "Pendiente";
  };

  const handleAnalyze = async () => {
    if (!fileState.file) return;
    if (!studentName.trim() || !studentParallel.trim()) {
      setError("Por favor completa el Nombre y Paralelo del estudiante.");
      return;
    }

    setStatus(AnalysisStatus.ANALYZING);
    setError(null);

    try {
      const base64 = await fileToBase64(fileState.file);
      const mimeType = fileState.file.type;
      
      const analysisText = await analyzeLogo(base64, mimeType, context);
      
      setResult(analysisText);
      setStatus(AnalysisStatus.SUCCESS);

      // Auto-save to database
      const grade = extractGrade(analysisText);
      const newRecord = saveEvaluation({
        studentName,
        studentParallel,
        grade,
        analysisText
      });
      
      // Update UI List
      setDbRecords(prev => [newRecord, ...prev]);

    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const downloadReport = (record: EvaluationRecord) => {
    const content = generateReportContent(record);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Evaluacion_${record.studentName.replace(/\s+/g, '_')}_${record.studentParallel}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de borrar este registro?')) {
      const updated = deleteEvaluation(id);
      setDbRecords(updated);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <CompositionBackground />

      <main className="relative z-10 flex-grow px-4 py-12 max-w-5xl mx-auto w-full">
        
        {/* Header */}
        <header className="text-center mb-12">
            <div className="inline-block border border-slate-300 bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold tracking-widest text-slate-500 mb-4 shadow-sm">
                ARTES PLÁSTICAS Y VISUALES
            </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
            Evaluador de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Logotipos</span> 4º Año
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Análisis de Iconografía, Iconología y Cosmovisión Andina/Amazónica en el diseño de marcas gráficas.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Input Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/90 backdrop-blur shadow-xl border border-slate-200 rounded-2xl p-6 md:p-8 sticky top-8">
              
              {/* Student Info Form */}
              <div className="mb-8 border-b border-slate-100 pb-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">1</span>
                  Datos del Estudiante
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nombre Completo</label>
                    <input 
                      type="text" 
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white/50"
                      disabled={status === AnalysisStatus.ANALYZING}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Curso / Paralelo</label>
                    <input 
                      type="text" 
                      value={studentParallel}
                      onChange={(e) => setStudentParallel(e.target.value)}
                      placeholder="Ej: 4to A Sec."
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white/50"
                      disabled={status === AnalysisStatus.ANALYZING}
                    />
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">2</span>
                Cargar Propuesta
              </h2>
              
              <LogoUploader 
                fileState={fileState} 
                onFileSelect={handleFileSelect} 
                onClear={handleClear}
                disabled={status === AnalysisStatus.ANALYZING}
              />

              <div className="mt-6">
                <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">3</span>
                    Contexto y Cosmovisión
                </h2>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Ej: Es un Puma geometrizado que representa el Kay Pacha (Fuerza). Usé patrones escalonados tiwanacotas para la síntesis..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 bg-white/50 resize-none h-28"
                  disabled={status === AnalysisStatus.ANALYZING}
                />
              </div>

              <div className="mt-8">
                <button
                  onClick={handleAnalyze}
                  disabled={!fileState.file || status === AnalysisStatus.ANALYZING || !studentName || !studentParallel}
                  className={`
                    w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform
                    flex items-center justify-center gap-2 shadow-lg
                    ${(!fileState.file || !studentName || !studentParallel)
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : status === AnalysisStatus.ANALYZING
                        ? 'bg-indigo-600 text-white cursor-wait opacity-90'
                        : 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-indigo-500/30 active:scale-[0.98]'
                    }
                  `}
                >
                  {status === AnalysisStatus.ANALYZING ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analizando Diseño...
                    </>
                  ) : (
                    <>
                      Evaluar y Guardar
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Output Column */}
          <div className="lg:col-span-7">
            {status === AnalysisStatus.SUCCESS && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex justify-between items-center">
                   <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Evaluación guardada en base de datos.
                   </span>
                   <button 
                     onClick={() => downloadReport({
                       id: 'temp',
                       studentName,
                       studentParallel,
                       timestamp: Date.now(),
                       grade: extractGrade(result),
                       analysisText: result
                     })}
                     className="text-sm font-bold underline hover:text-green-900"
                   >
                     Descargar Informe
                   </button>
                </div>
                <AnalysisDisplay markdownText={result} />
              </div>
            )}
            
            {status === AnalysisStatus.IDLE && (
               <div className="h-full flex items-center justify-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400">
                  <div className="text-center p-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      </div>
                      <p className="font-medium">Los resultados del análisis aparecerán aquí.</p>
                      <p className="text-sm mt-2 text-slate-400 max-w-xs mx-auto">Recuerda: El diseño debe ser un animal con síntesis cultural (No personas).</p>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* Database / History Section */}
        <div className="bg-white/90 backdrop-blur shadow-xl border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
              Base de Datos de Evaluaciones
            </h2>
            <span className="text-sm text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
              {dbRecords.length} Registros
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {dbRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No hay evaluaciones registradas todavía.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-bold">Fecha</th>
                    <th className="p-4 font-bold">Estudiante</th>
                    <th className="p-4 font-bold">Paralelo</th>
                    <th className="p-4 font-bold">Nota</th>
                    <th className="p-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dbRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-500">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-medium text-slate-800">{record.studentName}</td>
                      <td className="p-4 text-slate-600">{record.studentParallel}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                           record.grade.includes('10/100') || record.grade.includes('0/100') 
                           ? 'bg-red-100 text-red-700' 
                           : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {record.grade}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => downloadReport(record)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                        >
                          Descargar
                        </button>
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="text-red-400 hover:text-red-600"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </main>
      
      <footer className="relative z-10 py-6 text-center text-slate-400 text-sm bg-white/50 backdrop-blur-sm border-t border-slate-200 mt-auto">
        <p>© 2024 Artes Plásticas y Visuales. Herramienta Educativa.</p>
      </footer>
    </div>
  );
}

export default App;