import React from 'react';

const CompositionBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
      {/* Grid System */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Golden Ratio / Composition Lines */}
      <div className="absolute top-0 left-1/3 w-px h-full bg-rose-500 opacity-20"></div>
      <div className="absolute top-1/3 left-0 w-full h-px bg-rose-500 opacity-20"></div>
      
      {/* Geometric Shapes */}
      <div className="absolute top-20 right-20 w-64 h-64 border-2 border-indigo-200 rounded-full opacity-30 mix-blend-multiply"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-amber-100 rounded-full opacity-40 mix-blend-multiply blur-xl"></div>
      <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-teal-100 rotate-45 opacity-40 mix-blend-multiply blur-lg"></div>

      {/* Diagonal Guide */}
      <div className="absolute top-0 right-0 w-[150%] h-px bg-slate-300 origin-top-right rotate-45 opacity-20"></div>
    </div>
  );
};

export default CompositionBackground;