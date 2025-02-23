"use client"

import { useEffect, useState } from "react"
import { DashboardSection } from "@/app/components/dashboard-section"
import { EnvironmentSection } from "@/app/components/environment-section"
import { HealthSection } from "@/app/components/health-section"
import { IngredientsSection } from "@/app/components/ingredients-section"
import { PackagingSection } from "@/app/components/packaging-section"
import { PreferencesSection } from "@/app/components/preferences-section"
import { ProcessingSection } from "@/app/components/processing-section"
import { IProduct } from "@/lib/models/Product"
import { PastScans } from "@/app/components/past-scans"

export default function DashboardPage() {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestProduct = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      const products = await response.json();
      if (products.length > 0) {
        setProduct(products[0]); // Get the most recent product
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (selectedProduct: IProduct) => {
    setProduct(selectedProduct);
    // Scroll to top smoothly when switching products
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchLatestProduct();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Error</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h1 className="text-2xl font-bold text-yellow-800 mb-2">No Product Found</h1>
          <p className="text-yellow-600">No product has been scanned yet. Please scan a product to view its details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.brands && product.brands.length > 0 && (
              <p className="text-gray-600 mt-2">by {product.brands.join(', ')}</p>
            )}
          </div>

          <DashboardSection title="Matching with your preferences" defaultOpen>
            <PreferencesSection product={product} />
          </DashboardSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <DashboardSection title="Health" defaultOpen>
                <HealthSection product={product} />
              </DashboardSection>

              <DashboardSection title="Food processing">
                <ProcessingSection product={product} />
              </DashboardSection>
            </div>

            <div className="space-y-6">
              <DashboardSection title="Ingredients" defaultOpen>
                <IngredientsSection product={product} />
              </DashboardSection>

              <DashboardSection title="Environmental Impact">
                <EnvironmentSection product={product} />
              </DashboardSection>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {product.image_url && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-[500px] object-contain rounded-lg"
              />
            </div>
          )}

          <DashboardSection title="Past Scans">
            <PastScans 
              currentProductId={product._id} 
              onProductSelect={handleProductSelect}
            />
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}

