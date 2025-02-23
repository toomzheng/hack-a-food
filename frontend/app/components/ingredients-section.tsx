import { IProduct } from '../../lib/models/Product';

interface IngredientsSectionProps {
  product: IProduct;
}

export function IngredientsSection({ product }: IngredientsSectionProps) {
  // Split ingredients array into two columns
  const midPoint = Math.ceil(product.ingredients.length / 2);
  const leftColumnIngredients = product.ingredients.slice(0, midPoint);
  const rightColumnIngredients = product.ingredients.slice(midPoint);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Ingredients</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <div>
            {leftColumnIngredients.map((ingredient, index) => (
              <div key={index} className="flex items-center py-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full mr-2" />
                <span className="text-gray-700 text-sm">{ingredient}</span>
              </div>
            ))}
          </div>
          <div>
            {rightColumnIngredients.map((ingredient, index) => (
              <div key={index} className="flex items-center py-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full mr-2" />
                <span className="text-gray-700 text-sm">{ingredient}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Allergens</h3>
        {product.allergens.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {product.allergens.map((allergen, index) => (
              <div key={index} className="bg-red-50 px-3 py-1 rounded-full">
                <span className="text-red-600 text-sm">{allergen}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded">No allergens listed</p>
        )}
      </div>
    </div>
  );
}
