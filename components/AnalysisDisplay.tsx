import React from 'react';

interface AnalysisDisplayProps {
  markdownText: string;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ markdownText }) => {
  
  // Basic markdown parser for specific structure needed (Headers, Lists, Bold)
  // In a production app, use 'react-markdown', but here we do a simple render mapping for clean deps.
  
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold text-indigo-900 mt-6 mb-3 font-display border-b border-indigo-100 pb-1">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold text-slate-800 mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      
      // Bold
      const parts = line.split('**');
      if (parts.length > 1) {
         // Handle simple bolding
         return (
             <p key={index} className="mb-2 text-slate-700 leading-relaxed">
                {parts.map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900">{part}</strong> : part
                )}
             </p>
         );
      }

      // List items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={index} className="flex items-start gap-2 mb-2 ml-2">
            <span className="text-indigo-500 mt-1.5">•</span>
            <p className="text-slate-700 leading-relaxed flex-1">{line.replace(/^[-*]\s/, '')}</p>
          </div>
        );
      }

      // Numbered lists
      if (/^\d+\./.test(line.trim())) {
          return (
              <div key={index} className="flex items-start gap-2 mb-2 ml-2">
                  <span className="font-bold text-indigo-600 min-w-[20px]">{line.match(/^\d+\./)?.[0]}</span>
                  <p className="text-slate-700 leading-relaxed flex-1">{line.replace(/^\d+\.\s/, '')}</p>
              </div>
          )
      }

      // Empty lines
      if (line.trim() === '') return <div key={index} className="h-2"></div>;

      // Standard paragraph
      return <p key={index} className="mb-2 text-slate-700 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-8 shadow-xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-display">Resultado de la Evaluación</h2>
      </div>
      <div className="prose prose-slate max-w-none">
        {renderContent(markdownText)}
      </div>
    </div>
  );
};

export default AnalysisDisplay;