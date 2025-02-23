import { AlertTriangle, InfoIcon } from "lucide-react"
import { IProduct } from '@/lib/models/Product';
import { useMemo, useState } from 'react';
import { Badge } from "@/components/ui/badge"
import { InfoCard } from "@/components/ui/info-card"

interface ProcessingSectionProps {
  product: IProduct;
}

export function ProcessingSection({ product }: ProcessingSectionProps) {
  const [selectedAdditives, setSelectedAdditives] = useState<Map<string, boolean>>(new Map());

  const formattedAdditives = useMemo(() => {
    return product.additives_tags.map(additive => {
      // Remove language prefix (e.g., 'en:')
      const cleanAdditive = additive.split(':').pop() || '';
      
      // Format E-numbers
      if (cleanAdditive.toLowerCase().startsWith('e')) {
        // Convert e100 to E100 format
        const formattedE = cleanAdditive.charAt(0).toUpperCase() + cleanAdditive.slice(1);
        return formattedE.replace(/([0-9]+)([a-z])?/i, '$1$2');
      }
      
      // Format other additives by capitalizing and replacing hyphens
      return cleanAdditive
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    });
  }, [product.additives_tags]);

  const toggleAdditive = (index: number) => {
    setSelectedAdditives(prev => {
      const newMap = new Map(prev);
      const additive = product.additives_tags[index];
      newMap.set(additive, !prev.get(additive));
      return newMap;
    });
  };

  const novaGroupDescriptions = {
    1: 'Unprocessed or minimally processed foods',
    2: 'Processed culinary ingredients',
    3: 'Processed foods',
    4: 'Ultra-processed food and drink products',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-4 w-4" />
          <span>Ultra processed foods</span>
        </Badge>
      </div>

      {formattedAdditives.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Additives ({product.additives_n})</h3>
            <button
              onClick={() => toggleAdditive(0)}
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              <InfoIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formattedAdditives.map((additive, index) => (
              <button
                key={index}
                onClick={() => toggleAdditive(index)}
                className="bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-yellow-100 transition-colors"
              >
                {additive}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-2">NOVA Group</h3>
        <div className={`p-3 rounded ${
          product.nova_group === 1 ? 'bg-green-100 text-green-800' :
          product.nova_group === 2 ? 'bg-blue-100 text-blue-800' :
          product.nova_group === 3 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          <p className="font-medium">Group {product.nova_group}</p>
          <p className="text-sm mt-1">
            {novaGroupDescriptions[product.nova_group as 1 | 2 | 3 | 4] || 'Processing level unknown'}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Brands</h3>
        <div className="flex flex-wrap gap-2">
          {product.brands.map((brand, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* Render InfoCard for each selected additive */}
      {Array.from(selectedAdditives.entries()).map(([additive, isOpen]) => (
        isOpen && (
          <InfoCard
            key={additive}
            title={`Additive Information: ${additive.split(':').pop()}`}
            isOpen={true}
            onClose={() => toggleAdditive(product.additives_tags.indexOf(additive))}
            infoType="additive"
            additiveCode={additive}
          />
        )
      ))}
    </div>
  );
}

