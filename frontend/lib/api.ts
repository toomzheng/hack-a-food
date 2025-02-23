import { ProductData } from '@/lib/types';

const OFF_API_URL = 'https://world.openfoodfacts.org/api/v0/product/';

export async function getProductByBarcode(barcode: string): Promise<ProductData> {
  const response = await fetch(`${OFF_API_URL}${barcode}.json`, {
    headers: {
      'User-Agent': 'FoodScanner - Web - Version 1.0',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch product data');
  }

  const data = await response.json();
  
  if (data.status === 0) {
    throw new Error('Product not found');
  }

  return {
    code: data.code,
    product_name: data.product.product_name,
    brands: data.product.brands,
    ingredients_text: data.product.ingredients_text,
    nutriments: data.product.nutriments,
    allergens: data.product.allergens,
    labels: data.product.labels,
    categories: data.product.categories,
    packaging: data.product.packaging,
    nova_group: data.product.nova_group,
    nutriscore_grade: data.product.nutriscore_grade,
    image_url: data.product.image_url,
    additives_tags: data.product.additives_tags || [],
    additives_n: data.product.additives_n || 0,
    additives_old_tags: data.product.additives_old_tags || [],
  };
} 