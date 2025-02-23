import { IProduct } from '../../lib/models/Product';
import { useState } from 'react';
import { InfoIcon } from 'lucide-react';
import { InfoCard } from '@/components/ui/info-card';

interface HealthSectionProps {
  product: IProduct;
}

interface NutrientInfo {
  type: string;
  value: number;
  unit: string;
}

export function HealthSection({ product }: HealthSectionProps) {
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientInfo | null>(null);

  const getNutriScoreColor = (grade: string, isActive: boolean) => {
    const colors = {
      a: isActive ? 'bg-[#038141]' : 'bg-[#038141]/30',
      b: isActive ? 'bg-[#85BB2F]' : 'bg-[#85BB2F]/30',
      c: isActive ? 'bg-[#FECB02]' : 'bg-[#FECB02]/30',
      d: isActive ? 'bg-[#EE8100]' : 'bg-[#EE8100]/30',
      e: isActive ? 'bg-[#E63E11]' : 'bg-[#E63E11]/30',
    };
    return colors[grade.toLowerCase() as keyof typeof colors] || 'bg-gray-200';
  };

  const getNutriScoreText = (grade: string) => {
    const qualityMap: Record<string, string> = {
      'a': 'Higher nutritional quality',
      'b': 'Good nutritional quality',
      'c': 'Average nutritional quality',
      'd': 'Lower nutritional quality',
      'e': 'Lower nutritional quality'
    };
    return qualityMap[grade.toLowerCase()] || 'Nutritional quality not available';
  };

  const handleInfoClick = (type: string, value: number, unit: string) => {
    setSelectedNutrient({ type, value, unit });
  };

  const NutrientBox = ({ 
    title, 
    value, 
    unit 
  }: { 
    title: string; 
    value: number; 
    unit: string; 
  }) => (
    <div className="bg-gray-50 p-2 rounded relative group">
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium">{title}</p>
        <button
          onClick={() => handleInfoClick(title, value, unit)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <InfoIcon className="w-4 h-4 text-blue-500 hover:text-blue-600" />
        </button>
      </div>
      <p className="text-lg">{value.toFixed(2)}{unit}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {product.nutriscore_grade && (
        <div className="bg-red-50 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-4">
            <div className="flex">
              {['A', 'B', 'C', 'D', 'E'].map((grade) => {
                const isActive = grade.toLowerCase() === product.nutriscore_grade?.toLowerCase();
                return (
                  <div
                    key={grade}
                    className={`w-8 h-8 flex items-center justify-center text-white font-bold 
                      ${getNutriScoreColor(grade, isActive)}
                      ${grade === 'A' ? 'rounded-l-lg' : ''} 
                      ${grade === 'E' ? 'rounded-r-lg' : ''}
                      transition-colors duration-200
                    `}
                  >
                    {grade}
                  </div>
                );
              })}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-red-500">
                Nutri-Score {product.nutriscore_grade?.toUpperCase()}
              </h3>
              <p className="text-gray-600">
                {getNutriScoreText(product.nutriscore_grade)}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded inline-block">
            Nutrient Levels
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-2">Nutritional Information (per 100g) - Hover For Info!</h3>
        <div className="grid grid-cols-2 gap-2">
          <NutrientBox 
            title="Energy" 
            value={product.nutriments.energy_100g} 
            unit="kJ" 
          />
          <NutrientBox 
            title="Proteins" 
            value={product.nutriments.proteins_100g} 
            unit="g" 
          />
          <NutrientBox 
            title="Carbohydrates" 
            value={product.nutriments.carbohydrates_100g} 
            unit="g" 
          />
          <NutrientBox 
            title="Sugars" 
            value={product.nutriments.sugars_100g} 
            unit="g" 
          />
          <NutrientBox 
            title="Fat" 
            value={product.nutriments.fat_100g} 
            unit="g" 
          />
          <NutrientBox 
            title="Saturated Fat" 
            value={product.nutriments['saturated-fat_100g']} 
            unit="g" 
          />
          <NutrientBox 
            title="Fiber" 
            value={product.nutriments.fiber_100g} 
            unit="g" 
          />
          <NutrientBox 
            title="Salt" 
            value={product.nutriments.salt_100g} 
            unit="g" 
          />
        </div>
      </div>

      {selectedNutrient && (
        <InfoCard
          title={`About ${selectedNutrient.type}`}
          isOpen={true}
          onClose={() => setSelectedNutrient(null)}
          infoType="nutrient"
          nutrientType={selectedNutrient.type}
          value={selectedNutrient.value}
          unit={selectedNutrient.unit}
        />
      )}
    </div>
  );
}
