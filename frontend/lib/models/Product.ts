import mongoose from 'mongoose';

export interface IProduct {
  _id: string;
  barcode: string;
  name: string;
  brands: string[];
  ingredients: string[];
  nutriments: {
    energy_100g: number;
    proteins_100g: number;
    carbohydrates_100g: number;
    sugars_100g: number;
    fat_100g: number;
    'saturated-fat_100g': number;
    fiber_100g: number;
    salt_100g: number;
  };
  allergens: string[];
  labels: string[];
  categories: string[];
  packaging: string[];
  nova_group: number;
  nutriscore_grade: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  green_score?: number;
  match_score?: number;
  ecoscore_grade?: string;
  origins?: string;
  origins_tags?: string[];
  recycling?: string;
  additives_tags: string[];
  additives_n: number;
}

const productSchema = new mongoose.Schema<IProduct>({
  barcode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brands: [String],
  ingredients: [String],
  nutriments: {
    type: {
      energy_100g: { type: Number, default: 0 },
      proteins_100g: { type: Number, default: 0 },
      carbohydrates_100g: { type: Number, default: 0 },
      sugars_100g: { type: Number, default: 0 },
      fat_100g: { type: Number, default: 0 },
      'saturated-fat_100g': { type: Number, default: 0 },
      fiber_100g: { type: Number, default: 0 },
      salt_100g: { type: Number, default: 0 },
    },
    default: {},
  },
  allergens: [String],
  labels: [String],
  categories: [String],
  packaging: [String],
  nova_group: { type: Number, default: 0 },
  nutriscore_grade: { type: String, default: '' },
  image_url: String,
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
  green_score: { type: Number, default: 0 },
  match_score: { type: Number, default: 0 },
  ecoscore_grade: String,
  origins: String,
  origins_tags: [String],
  recycling: String,
  additives_tags: { type: [String], default: [] },
  additives_n: { type: Number, default: 0 },
});

// Add middleware to update the updated_at field on save
productSchema.pre('save', function(next) {
  this.updated_at = new Date().toISOString();
  
  // Calculate green score
  let greenScore = 0;
  if (this.labels.some(l => l.toLowerCase().includes('organic'))) greenScore += 30;
  if (this.labels.some(l => l.toLowerCase().includes('eco'))) greenScore += 20;
  if (this.labels.some(l => l.toLowerCase().includes('sustainable'))) greenScore += 20;
  if (this.nova_group === 1 || this.nova_group === 2) greenScore += 30;
  this.green_score = Math.min(greenScore, 100);

  // Calculate match score
  let matchScore = 0;
  if (this.nutriscore_grade === 'a' || this.nutriscore_grade === 'b') matchScore += 40;
  if (this.allergens.length === 0) matchScore += 30;
  if (this.nova_group === 1 || this.nova_group === 2) matchScore += 30;
  this.match_score = Math.min(matchScore, 100);

  next();
});

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema); 