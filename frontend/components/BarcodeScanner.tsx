import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  isScanning: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeDetected, isScanning }) => {
  const webcamRef = useRef<Webcam>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isScanning) return;

    const codeReader = new BrowserMultiFormatReader();
    let mounted = true;

    const scanBarcode = async () => {
      if (!webcamRef.current?.video) return;

      try {
        const result = await codeReader.decodeFromVideoElement(webcamRef.current.video);
        if (result && mounted) {
          onBarcodeDetected(result.getText());
        }
      } catch (error) {
        // Ignore errors - they occur when no barcode is detected
      }

      if (mounted && isScanning) {
        requestAnimationFrame(scanBarcode);
      }
    };

    scanBarcode();

    return () => {
      mounted = false;
      codeReader.reset();
    };
  }, [isScanning, onBarcodeDetected]);

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
            onUserMediaError={(error) => setError('Camera access denied')}
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