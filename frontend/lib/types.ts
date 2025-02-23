export interface ProductData {
  code: string;
  product_name: string;
  brands?: string;
  ingredients_text?: string;
  nutriments?: {
    energy_100g?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    sugars_100g?: number;
    fat_100g?: number;
    'saturated-fat_100g'?: number;
    fiber_100g?: number;
    salt_100g?: number;
  };
  allergens?: string;
  labels?: string;
  categories?: string;
  packaging?: string;
  nova_group?: number;
  nutriscore_grade?: string;
  image_url?: string;
  additives_tags?: string[];
  additives_n?: number;
  additives_old_tags?: string[];
} 