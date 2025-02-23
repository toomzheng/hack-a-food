import mongoose from 'mongoose';

export interface IProduct {
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
    saturated_fat_100g: number;
    fiber_100g: number;
    salt_100g: number;
  };
  allergens: string[];
  labels: string[];
  categories: string[];
  packaging: string[];
  nova_group: number;
  nutriscore_grade: string;
  image_url: string;
  created_at: Date;
  updated_at: Date;
}

const productSchema = new mongoose.Schema<IProduct>({
  barcode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brands: { type: [String], default: [] },
  ingredients: { type: [String], default: [] },
  nutriments: {
    type: {
      energy_100g: { type: Number, default: 0 },
      proteins_100g: { type: Number, default: 0 },
      carbohydrates_100g: { type: Number, default: 0 },
      sugars_100g: { type: Number, default: 0 },
      fat_100g: { type: Number, default: 0 },
      saturated_fat_100g: { type: Number, default: 0 },
      fiber_100g: { type: Number, default: 0 },
      salt_100g: { type: Number, default: 0 },
    },
    default: {},
  },
  allergens: { type: [String], default: [] },
  labels: { type: [String], default: [] },
  categories: { type: [String], default: [] },
  packaging: { type: [String], default: [] },
  nova_group: { type: Number, default: 0 },
  nutriscore_grade: { type: String, default: '' },
  image_url: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Add middleware to update the updated_at field on save
productSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema); 