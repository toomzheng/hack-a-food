import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import { getProductByBarcode } from '@/lib/api';
import { ProductData } from '@/lib/types';

interface BarcodeScannerProps {
  onProductFound: (product: ProductData) => void;
  isScanning: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onProductFound, isScanning }) => {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const [error, setError] = useState<string>('');
  const [scanning, setScanning] = useState(false);

  const saveToMongoDB = async (product: ProductData) => {
    try {
      console.log('Attempting to save product:', product);
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barcode: product.code,
          name: product.product_name,
          brands: product.brands?.split(',').map(b => b.trim()) || [],
          ingredients: product.ingredients_text?.split(',').map(i => i.trim()) || [],
          nutriments: {
            energy_100g: product.nutriments?.energy_100g || 0,
            proteins_100g: product.nutriments?.proteins_100g || 0,
            carbohydrates_100g: product.nutriments?.carbohydrates_100g || 0,
            sugars_100g: product.nutriments?.sugars_100g || 0,
            fat_100g: product.nutriments?.fat_100g || 0,
            'saturated-fat_100g': product.nutriments?.['saturated-fat_100g'] || 0,
            fiber_100g: product.nutriments?.fiber_100g || 0,
            salt_100g: product.nutriments?.salt_100g || 0,
          },
          allergens: product.allergens?.split(',').map(a => a.trim()) || [],
          labels: product.labels?.split(',').map(l => l.trim()) || [],
          categories: product.categories?.split(',').map(c => c.trim()) || [],
          packaging: product.packaging?.split(',').map(p => p.trim()) || [],
          nova_group: product.nova_group || 0,
          nutriscore_grade: product.nutriscore_grade || '',
          image_url: product.image_url || '',
          additives_tags: product.additives_tags || [],
          additives_n: product.additives_n || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          console.error('Server error:', errorData);
          throw new Error(`Failed to save to MongoDB: ${errorData.error || response.statusText}`);
        } catch (e) {
          console.error('Error parsing error response:', e);
          throw new Error(`Failed to save to MongoDB: ${response.statusText}`);
        }
      }

      try {
        const savedProduct = JSON.parse(responseText);
        console.log('Successfully saved product:', savedProduct);
        return savedProduct;
      } catch (e) {
        console.error('Error parsing success response:', e);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error saving to MongoDB:', error);
      setError(error instanceof Error ? error.message : 'Failed to save product');
      throw error;
    }
  };

  useEffect(() => {
    if (!isScanning) return;

    const codeReader = new BrowserMultiFormatReader();
    let mounted = true;

    const scanBarcode = async () => {
      if (!webcamRef.current?.video || scanning) return;

      try {
        const result = await codeReader.decodeFromVideoElement(webcamRef.current.video);
        if (result && mounted) {
          setScanning(true);
          try {
            console.log('Barcode detected:', result.getText());
            const product = await getProductByBarcode(result.getText());
            console.log('Product data fetched:', product);
            const savedProduct = await saveToMongoDB(product);
            onProductFound(savedProduct);
            router.push('/dashboard');
          } catch (error) {
            console.error('Error in scan process:', error);
            setError(error instanceof Error ? error.message : 'Failed to process product');
            setScanning(false);
          }
        }
      } catch (error) {
        // Ignore errors - they occur when no barcode is detected
      }

      if (mounted && isScanning && !scanning) {
        requestAnimationFrame(scanBarcode);
      }
    };

    scanBarcode();

    return () => {
      mounted = false;
      codeReader.reset();
    };
  }, [isScanning, onProductFound, scanning, router]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {isScanning && (
        <>
          <Webcam
            ref={webcamRef}
            className="w-full rounded-lg shadow-lg"
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: 'environment',
              width: 640,
              height: 480,
            }}
            onUserMediaError={(error) => {
              console.error('Camera error:', error);
              setError('Camera access denied');
            }}
          />
          <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
          {error && (
            <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center rounded-t-lg">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BarcodeScanner; 