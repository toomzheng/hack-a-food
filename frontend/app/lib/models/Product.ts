export interface IProduct {
  _id: string;
  code: string;
  name: string;
  brands: string[];
  categories: string[];
  labels: string[];
  nutriments: {
    energy_100g: number;
    proteins_100g: number;
    carbohydrates_100g: number;
    sugars_100g: number;
    fat_100g: number;
    saturated_fat_100g: number;
    fiber_100g: number;
    salt_100g: number;
  };
  nutriscore_grade: string;
  nova_group: number;
  ingredients: string[];
  allergens: string[];
  ecoscore_grade?: string;
  origins?: string;
  origins_tags?: string[];
  packaging: string[];
  recycling?: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
} 