'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IProduct } from '@/lib/models/Product';
import { getProductByBarcode } from '@/lib/api';

// Shopping cart icon
const foodIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <!-- Cart -->
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    <!-- Product boxes -->
    <rect x="9" y="8" width="3" height="4" rx="0.5" />
    <rect x="14" y="8" width="3" height="4" rx="0.5" />
  </svg>
`;

// Simple interface for what we need
interface DisplayProduct {
  name: string;
  image: string;
  grade: string;
}

export function RecommendationsSection({ product }: { product: IProduct }) {
  const [loading, setLoading] = useState(false);
  const [displayProducts, setDisplayProducts] = useState<DisplayProduct[]>([]);

  const getRecommendations = async () => {
    try {
      setLoading(true);
      
      // 1. Get recommendations from our backend
      const response = await fetch('http://localhost:8000/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          categories: product.categories || [],
          labels: product.labels || [],
          nutriscore_grade: product.nutriscore_grade || '',
          _id: product._id
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();

      // 2. For each recommendation, get the image from OpenFoodFacts
      const displayProducts: DisplayProduct[] = [];
      
      for (const rec of data.recommendations) {
        try {
          // Get product data from OpenFoodFacts using the barcode (_id)
          const offProduct = await getProductByBarcode(rec._id);
          
          // Try multiple image sources
          const image = offProduct.image_url || 
                       offProduct.image_front_url ||
                       offProduct.image_front_small_url ||
                       offProduct.selected_images?.front?.display?.url ||
                       offProduct.selected_images?.front?.small?.url ||
                       '';
          
          // Add to our display array
          displayProducts.push({
            name: rec.product_name,
            image: image,
            grade: rec.nutriscore_grade || 'N/A'
          });

          // If we didn't get an image, try the Open Food Facts direct URL format
          if (!image) {
            const barcode = rec._id;
            const directImageUrl = `https://images.openfoodfacts.org/images/products/${barcode.slice(0,3)}/${barcode.slice(3,6)}/${barcode.slice(6,9)}/${barcode.slice(9)}/front.jpg`;
            displayProducts[displayProducts.length - 1].image = directImageUrl;
          }
        } catch (error) {
          console.error(`Failed to get OpenFoodFacts data for ${rec._id}:`, error);
          // Try the direct URL format even if the API call failed
          const barcode = rec._id;
          const directImageUrl = `https://images.openfoodfacts.org/images/products/${barcode.slice(0,3)}/${barcode.slice(3,6)}/${barcode.slice(6,9)}/${barcode.slice(9)}/front.jpg`;
          
          displayProducts.push({
            name: rec.product_name,
            image: directImageUrl,
            grade: rec.nutriscore_grade || 'N/A'
          });
        }
      }

      setDisplayProducts(displayProducts);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getNutriScoreColor = (score: string) => {
    switch (score?.toLowerCase()) {
      case 'a': return 'text-green-600';
      case 'b': return 'text-green-500';
      case 'c': return 'text-yellow-500';
      case 'd': return 'text-orange-500';
      case 'e': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-center">Similar Products</h2>
        <Button 
          onClick={getRecommendations}
          disabled={loading}
          variant="outline"
          size="sm"
          className="bg-white hover:bg-gray-50"
        >
          {loading ? 'Getting Recommendations...' : 'Find Similar Products'}
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 w-full justify-center">
        {displayProducts.map((product, index) => (
          <div key={index} className="flex-none w-[200px] bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative w-full pt-[100%]">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute top-0 left-0 w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Try the small version if the regular version fails
                    if (target.src.includes('/front.jpg')) {
                      target.src = target.src.replace('/front.jpg', '/front_small.jpg');
                    } else if (target.src.includes('/front_small.jpg')) {
                      // If small version fails, hide image and show "No Image" text
                      const parent = target.parentElement;
                      if (parent) {
                        target.style.display = 'none';
                        const noImageDiv = document.createElement('div');
                        noImageDiv.className = 'w-full h-full flex flex-col items-center justify-center text-gray-400';
                        noImageDiv.innerHTML = `
                          <div class="h-16 w-16 mb-2">
                            ${foodIcon}
                          </div>
                          <span class="text-sm mt-2">No Image Available</span>
                          <span class="text-xs mt-1 text-gray-500">${product.name}</span>
                        `;
                        parent.appendChild(noImageDiv);
                      }
                    } else {
                      const barcode = target.src.split('/products/')[1]?.split('/front')[0];
                      if (barcode) {
                        target.src = `https://images.openfoodfacts.org/images/products/${barcode}/front.jpg`;
                      } else {
                        // If all attempts fail, show "No Image" with nice styling
                        const parent = target.parentElement;
                        if (parent) {
                          target.style.display = 'none';
                          const noImageDiv = document.createElement('div');
                          noImageDiv.className = 'w-full h-full flex flex-col items-center justify-center text-gray-400';
                          noImageDiv.innerHTML = `
                            <div class="h-16 w-16 mb-2">
                              ${foodIcon}
                            </div>
                            <span class="text-sm mt-2">No Image Available</span>
                            <span class="text-xs mt-1 text-gray-500">${product.name}</span>
                          `;
                          parent.appendChild(noImageDiv);
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <div className="h-16 w-16 mb-2" dangerouslySetInnerHTML={{ __html: foodIcon }} />
                  <span className="text-sm mt-2">No Image Available</span>
                  <span className="text-xs mt-1 text-gray-500">{product.name}</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] mb-2">
                {product.name}
              </h3>
              <div className="flex items-center gap-1">
                <span className="text-gray-600 text-sm">Nutri-Score: </span>
                <span className={`font-medium text-sm ${getNutriScoreColor(product.grade)}`}>
                  {product.grade.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
