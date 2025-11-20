import React, { ChangeEvent, useRef } from 'react';
import { FileInputState } from '../types';

interface LogoUploaderProps {
  fileState: FileInputState;
  onFileSelect: (file: File, previewUrl: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ fileState, onFileSelect, onClear, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      onFileSelect(file, previewUrl);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full mb-6">
      <input
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={disabled}
      />

      {!fileState.previewUrl ? (
        <div 
          onClick={triggerFileSelect}
          className={`
            border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300
            ${disabled ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-50' : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50/30 bg-white/50'}
          `}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="space-y-1">
              <p className="font-medium text-slate-700">Sube tu propuesta de logotipo</p>
              <p className="text-sm text-slate-500">Formatos: PNG, JPG, WEBP</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="aspect-video w-full relative bg-slate-100 flex items-center justify-center p-4">
            <img 
              src={fileState.previewUrl} 
              alt="Logo Preview" 
              className="max-h-64 object-contain shadow-lg rounded-lg"
            />
          </div>
          {!disabled && (
            <button
              onClick={onClear}
              className="absolute top-2 right-2 bg-white/90 backdrop-blur text-slate-600 p-2 rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Eliminar imagen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LogoUploader;