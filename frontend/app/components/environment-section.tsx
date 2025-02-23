import { IProduct } from '@/lib/models/Product';
import { Package } from 'lucide-react';

interface EnvironmentSectionProps {
  product: IProduct;
}

export function EnvironmentSection({ product }: EnvironmentSectionProps) {
  const getEcoScoreColor = (grade: string) => {
    const colors = {
      'a': 'bg-[#1E8F4E]',
      'b': 'bg-[#2ECC71]',
      'c': 'bg-[#FFD700]',
      'd': 'bg-[#FF8C00]',
      'e': 'bg-[#E74C3C]'
    };
    return colors[grade.toLowerCase() as keyof typeof colors] || 'bg-gray-400';
  };

  const getEcoScoreText = (grade: string) => {
    const descriptions = {
      'a': 'Very low environmental impact',
      'b': 'Low environmental impact',
      'c': 'Moderate environmental impact',
      'd': 'High environmental impact',
      'e': 'Very high environmental impact'
    };
    return descriptions[grade.toLowerCase() as keyof typeof descriptions] || 'Impact not available';
  };

  return (
    <div className="space-y-8">
      {/* Eco-Score Section */}
      <div>
        <h3 className="font-semibold mb-4">Eco-Score</h3>
        <div className="bg-green-50 p-4 rounded-lg">
          {product.ecoscore_grade ? (
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getEcoScoreColor(product.ecoscore_grade)}`}>
                {product.ecoscore_grade.toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{getEcoScoreText(product.ecoscore_grade)}</p>
                <p className="text-sm text-gray-600">Based on lifecycle analysis</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">B</p>
          )}
        </div>
      </div>

      {/* Origins Section */}
      <div>
        <h3 className="font-semibold mb-4">Origins</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          {product.origins ? (
            <div>
              <p className="text-gray-800">{product.origins}</p>
              {product.origins_tags && product.origins_tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.origins_tags.map((tag: string, index: number) => (
                    <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">North America</p>
          )}
        </div>
      </div>

      {/* Packaging Section */}
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Packaging Information
        </h3>
        <div className="space-y-4">
          {/* Packaging Materials */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Materials</h4>
            {product.packaging && product.packaging.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {product.packaging.map((material: string, index: number) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {material}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Packaging information not available</p>
            )}
          </div>

          {/* Recycling Instructions */}
          {product.recycling && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Recycling Instructions</h4>
              <p className="text-gray-800">{product.recycling}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

