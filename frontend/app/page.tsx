"use client"

import { useState } from "react"
import BarcodeScanner from "@/components/BarcodeScanner"
import ProductInfo from "@/components/ProductInfo"

interface OpenFoodFactsProduct {
  product_name: string;
  brands: string;
  image_url: string;
  nutrition_grades: string;
  nutriments: {
    'energy-kcal_100g': number;
    'fat_100g': number;
    'saturated-fat_100g': number;
    'carbohydrates_100g': number;
    'sugars_100g': number;
    'fiber_100g': number;
    'proteins_100g': number;
    'salt_100g': number;
  };
  ingredients_text: string;
  allergens: string;
}

export default function Home() {
  const [isScanning, setIsScanning] = useState(false)
  const [productData, setProductData] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleBarcodeDetected = async (barcode: string) => {
    setIsScanning(false)
    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        {
          headers: {
            'User-Agent': 'FoodNutritionScanner - Web - Version 1.0'
          }
        }
      )
      
      const data = await response.json()
      
      if (data.status !== 1) {
        throw new Error("Product not found")
      }

      const product = data.product as OpenFoodFactsProduct
      
      setProductData({
        name: product.product_name || 'N/A',
        brand: product.brands,
        image_url: product.image_url,
        nutrition_grade: (product.nutrition_grades || 'N/A').toUpperCase(),
        nutrients: {
          energy_kcal: product.nutriments['energy-kcal_100g'],
          fat: product.nutriments['fat_100g'],
          saturated_fat: product.nutriments['saturated-fat_100g'],
          carbohydrates: product.nutriments['carbohydrates_100g'],
          sugars: product.nutriments['sugars_100g'],
          fiber: product.nutriments['fiber_100g'],
          proteins: product.nutriments['proteins_100g'],
          salt: product.nutriments['salt_100g']
        },
        ingredients: product.ingredients_text,
        allergens: product.allergens
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch product data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Food Product Scanner</h1>
        
        <div className="mb-8 text-center">
          <button
            onClick={() => setIsScanning(!isScanning)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            {isScanning ? "Stop Scanning" : "Start Scanning"}
          </button>
        </div>

        <div className="mb-8">
          <BarcodeScanner
            isScanning={isScanning}
            onBarcodeDetected={handleBarcodeDetected}
          />
        </div>

        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8">
            {error}
          </div>
        )}

        {productData && !loading && (
          <ProductInfo
            name={productData.name}
            brand={productData.brand}
            image_url={productData.image_url}
            nutrition_grade={productData.nutrition_grade}
            nutrients={productData.nutrients}
            ingredients={productData.ingredients}
            allergens={productData.allergens}
          />
        )}
      </div>
    </main>
  )
}
