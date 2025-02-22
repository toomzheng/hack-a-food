import { useEffect, useState } from 'react';

export interface ProductInfo {
  name: string;
  brand: string;
  ingredients: string[];
  nutrition_facts: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  allergens: string[];
  environmental_impact: string;
  packaging: string;
  processing: string;
}

export function useRecentScan() {
  const [data, setData] = useState<ProductInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentScan = async () => {
      try {
        const response = await fetch('http://localhost:5001/recent');
        if (!response.ok) {
          throw new Error('Failed to fetch recent scan');
        }
        const data = await response.json();
        setData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recent scan');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentScan();
  }, []);

  return { data, loading, error };
}
