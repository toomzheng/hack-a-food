import { IProduct } from '@/lib/models/Product';

interface HealthSectionProps {
  product: IProduct;
}

export function HealthSection({ product }: HealthSectionProps) {
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
        <h3 className="font-semibold mb-2">Nutritional Information (per 100g)</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-sm font-medium">Energy</p>
            <p className="text-lg">{product.nutriments.energy_100g?.toFixed(2)} kJ</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-sm font-medium">Proteins</p>
            <p className="text-lg">{product.nutriments.proteins_100g?.toFixed(2)}g</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-sm font-medium">Carbohydrates</p>
            <p className="text-lg">{product.nutriments.carbohydrates_100g?.toFixed(2)}g</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-sm font-medium">Sugars</p>
            <p className="text-lg">{product.nutriments.sugars_100g?.toFixed(2)}g</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-sm font-medium">Fat</p>
            <p className="text-lg">{product.nutriments.fat_100g?.toFixed(2)}g</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-sm font-medium">Saturated Fat</p>
            <p className="text-lg">{product.nutriments['saturated-fat_100g']?.toFixed(2)}g</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-sm font-medium">Fiber</p>
            <p className="text-lg">{product.nutriments.fiber_100g?.toFixed(2)}g</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-sm font-medium">Salt</p>
            <p className="text-lg">{product.nutriments.salt_100g?.toFixed(2)}g</p>
          </div>
        </div>
      </div>
    </div>
  );
}

