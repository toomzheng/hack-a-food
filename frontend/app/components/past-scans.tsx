import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { X } from "lucide-react"
import { IProduct } from "@/lib/models/Product"

interface PastScansProps {
  currentProductId: string;
  onProductSelect: (product: IProduct) => void;
}

export function PastScans({ currentProductId, onProductSelect }: PastScansProps) {
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const products = await response.json();
      setAllProducts(products);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // If we're deleting the current product, select the next available one
      if (productId === currentProductId && allProducts.length > 1) {
        const currentIndex = allProducts.findIndex(p => p._id === currentProductId);
        const nextProduct = allProducts[currentIndex + 1] || allProducts[currentIndex - 1];
        onProductSelect(nextProduct);
      }

      // Update the products list
      setAllProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm p-4">
        Failed to load scans
      </div>
    );
  }

  if (allProducts.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-4">
        No scans found
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      {allProducts.map((product) => (
        <div
          key={product._id}
          className={`group rounded-lg shadow-sm p-3 flex items-center gap-4 transition-all relative
            ${product._id === currentProductId 
              ? 'bg-gray-100 ring-1 ring-gray-200' 
              : 'bg-white hover:bg-gray-50'}`}
        >
          <div 
            className="flex-1 min-w-0 cursor-pointer flex items-center gap-4"
            onClick={() => onProductSelect(product)}
          >
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-12 h-12 object-contain rounded"
              />
            )}
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(product.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {product._id !== currentProductId && (
            <button
              onClick={() => handleDelete(product._id)}
              className="opacity-0 group-hover:opacity-100 absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-red-50 rounded-full transition-all duration-200"
              aria-label="Delete scan"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
} 