import { IProduct } from '@/lib/models/Product';

interface PreferencesSectionProps {
  product: IProduct;
}

export function PreferencesSection({ product }: PreferencesSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Product Categories</h3>
        <div className="flex flex-wrap gap-2">
          {product.categories.map((category, index) => (
            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              {category}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Labels</h3>
        <div className="flex flex-wrap gap-2">
          {product.labels.map((label, index) => (
            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

