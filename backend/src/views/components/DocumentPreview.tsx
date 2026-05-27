import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { getGcpUrl } from '../../config/gcp';

interface DocumentPreviewProps {
  src?: string | null;
  type?: string | null;
  name?: string | null;
}

const normalizeSource = (src?: string | null): string | undefined => {
  if (!src) return undefined;
  if (src.startsWith('blob:')) return src;
  if (src.startsWith('/uploads') || src.startsWith('uploads/')) return src.startsWith('/') ? src : `/${src}`;
  
  // Google Cloud Storage URLs (gs:// ou https://storage.googleapis.com/)
  if (src.startsWith('gs://') || src.includes('storage.googleapis.com')) {
    return getGcpUrl(src);
  }
  
  return src;
};

const getPreviewType = (src?: string | null, type?: string | null) => {
  const normalizedType = type?.toLowerCase();
  if (normalizedType?.startsWith('image/') || (src && /(jpg|jpeg|png|gif|bmp|webp)$/i.test(src))) {
    return 'image';
  }
  if (normalizedType === 'application/pdf' || (src && /\.pdf$/i.test(src))) {
    return 'pdf';
  }
  return 'other';
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ src, type, name }) => {
  const [error, setError] = useState<string | null>(null);
  const effectiveSrc = normalizeSource(src);
  
  console.log('[DocumentPreview] src:', src, 'effectiveSrc:', effectiveSrc, 'type:', type);

  if (!effectiveSrc) {
    return (
      <div className="border border-slate-300 rounded-lg p-6 text-center text-slate-500">
        Aucun document à prévisualiser (src vide)
      </div>
    );
  }

  const previewType = getPreviewType(effectiveSrc, type);
  console.log('[DocumentPreview] previewType:', previewType);

  if (previewType === 'image') {
    return <img src={effectiveSrc} alt={name || 'Aperçu du document'} className="w-full max-h-[400px] object-contain rounded" />;
  }

  if (previewType === 'pdf') {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col">
        <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2 text-sm text-blue-700">
          Chargement depuis: {effectiveSrc}
        </div>
        <iframe 
          src={effectiveSrc} 
          className="w-full flex-1 min-h-[500px] rounded" 
          title={name || 'Aperçu PDF'}
          onError={() => setError('Erreur chargement iframe')}
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-40 text-slate-500">
      <FileText size={48} />
      <p className="mt-2">Aperçu non disponible pour ce type de fichier</p>
      <a
        href={effectiveSrc}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 text-emerald-600 hover:underline"
      >
        Ouvrir le document
      </a>
    </div>
  );
};
