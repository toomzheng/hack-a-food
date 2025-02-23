"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import BarcodeScanner from "@/components/BarcodeScanner"
import { ProductData } from "@/lib/types"

export default function HomePage() {
  const [isScanning, setIsScanning] = useState(false)
  const router = useRouter()

  const handleProductFound = (product: ProductData) => {
    // Product is already saved to MongoDB by the BarcodeScanner component
    router.push('/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Food Scanner</h1>
      {!isScanning ? (
        <Button onClick={() => setIsScanning(true)} size="lg">
          Scan Food
        </Button>
      ) : (
        <div className="w-full max-w-md">
          <BarcodeScanner 
            isScanning={isScanning} 
            onProductFound={handleProductFound} 
          />
          <Button 
            onClick={() => setIsScanning(false)} 
            variant="outline" 
            className="mt-4 w-full"
          >
            Cancel Scan
          </Button>
        </div>
      )}
    </div>
  )
}

