'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IProduct } from '@/lib/models/Product';
import { getProductByBarcode } from '@/lib/api';

// Simple interface for what we need
interface DisplayProduct {
  name: string;
  image: string;
  grade: string;
}

export function RecommendationsSection({ product }: { product: IProduct }) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<DisplayProduct[]>([]);

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

      setProducts(displayProducts);
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
    <div className="bg-gray-50 py-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-6 px-6">
          <h2 className="text-xl font-semibold text-gray-900">Similar Products</h2>
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

        {products.length > 0 && (
          <div className="relative">
            <div className="overflow-x-auto pb-4 hide-scrollbar">
              <div className="flex gap-4 px-6" style={{ minWidth: 'min-content' }}>
                {products.map((product, index) => (
                  <div 
                    key={index}
                    className="flex-none"
                    style={{ width: '300px' }}
                  >
                    <div className="bg-white border rounded-lg p-4 h-full">
                      <div className="aspect-square w-full mb-4 bg-gray-50 rounded-md overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              // Try the small version if the regular version fails
                              if (target.src.includes('/front.jpg')) {
                                target.src = target.src.replace('/front.jpg', '/front_small.jpg');
                              } else if (target.src.includes('/front_small.jpg')) {
                                target.style.display = 'none';
                              } else {
                                const barcode = target.src.split('/products/')[1]?.split('/front')[0];
                                if (barcode) {
                                  target.src = `https://images.openfoodfacts.org/images/products/${barcode}/front.jpg`;
                                } else {
                                  target.style.display = 'none';
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No image</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      <div className="mt-2">
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
          </div>
        )}
      </div>

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
