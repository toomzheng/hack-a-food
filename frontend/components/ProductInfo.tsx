import React from 'react';

interface Nutrients {
  energy_kcal: number;
  fat: number;
  saturated_fat: number;
  carbohydrates: number;
  sugars: number;
  fiber: number;
  proteins: number;
  salt: number;
}

interface ProductInfoProps {
  name: string;
  brand?: string;
  image_url?: string;
  nutrition_grade?: string;
  nutrients: Nutrients;
  ingredients?: string;
  allergens?: string;
}

const NutritionGradeColors: Record<string, string> = {
  'A': 'bg-green-500',
  'B': 'bg-lime-500',
  'C': 'bg-yellow-500',
  'D': 'bg-orange-500',
  'E': 'bg-red-500',
};

const ProductInfo: React.FC<ProductInfoProps> = ({
  name,
  brand,
  image_url,
  nutrition_grade,
  nutrients,
  ingredients,
  allergens,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {image_url && (
          <div className="w-full md:w-1/3">
            <img
              src={image_url}
              alt={name}
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        )}
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{name}</h2>
          {brand && <p className="text-gray-600 mb-4">{brand}</p>}
          
          {nutrition_grade && (
            <div className="mb-4">
              <span className="font-semibold">Nutrition Grade: </span>
              <span className={`${NutritionGradeColors[nutrition_grade]} text-white px-2 py-1 rounded`}>
                {nutrition_grade}
              </span>
            </div>
          )}
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Nutrition Facts (per 100g)</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>Energy</div>
              <div>{nutrients.energy_kcal} kcal</div>
              <div>Fat</div>
              <div>{nutrients.fat}g</div>
              <div>Saturated Fat</div>
              <div>{nutrients.saturated_fat}g</div>
              <div>Carbohydrates</div>
              <div>{nutrients.carbohydrates}g</div>
              <div>Sugars</div>
              <div>{nutrients.sugars}g</div>
              <div>Fiber</div>
              <div>{nutrients.fiber}g</div>
              <div>Proteins</div>
              <div>{nutrients.proteins}g</div>
              <div>Salt</div>
              <div>{nutrients.salt}g</div>
            </div>
          </div>
          
          {ingredients && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
              <p className="text-gray-700">{ingredients}</p>
            </div>
          )}
          
          {allergens && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Allergens</h3>
              <p className="text-red-600">{allergens}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInfo; 