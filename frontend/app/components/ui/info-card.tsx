import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface InfoCardProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  nutrientType: string;
  value: number;
  unit: string;
}

export function InfoCard({ title, isOpen, onClose, nutrientType, value, unit }: InfoCardProps) {
  const [info, setInfo] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchNutrientInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/nutrition-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nutrientType,
          value,
          unit,
        }),
      });
      
      const data = await response.json();
      setInfo(data.info);
    } catch (error) {
      console.error('Error fetching nutrient info:', error);
      setInfo('Failed to load information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch info when card opens
  useState(() => {
    if (isOpen) {
      fetchNutrientInfo();
    }
  }, [isOpen, nutrientType, value]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">{title}</h3>
          
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