import { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';

interface InfoCardProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  infoType: 'nutrient' | 'additive';
  nutrientType?: string;
  value?: number;
  unit?: string;
  additiveCode?: string;
}

export function InfoCard({ 
  title, 
  isOpen, 
  onClose, 
  infoType,
  nutrientType,
  value,
  unit,
  additiveCode 
}: InfoCardProps) {
  const [info, setInfo] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  const fetchInfo = async () => {
    try {
      setLoading(true);
      const endpoint = infoType === 'nutrient' ? '/api/nutrition-info' : '/api/additive-info';
      const body = infoType === 'nutrient' 
        ? { nutrientType, value, unit }
        : { additiveCode };

      console.log('Fetching from endpoint:', endpoint, 'with body:', body);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch info: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setInfo(data.info);
    } catch (error) {
      console.error('Error fetching info:', error);
      setInfo('Failed to load information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInfo();
      // Add event listener for escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, infoType, nutrientType, value, additiveCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-lg relative animate-in fade-in-0 zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 pr-8">{title}</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: info }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 