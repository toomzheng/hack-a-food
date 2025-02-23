"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import BarcodeScanner from "@/components/BarcodeScanner"
import { ProductData } from "@/lib/types"
import { Particles } from "@/components/ui/particles"

export default function HomePage() {
  const [isScanning, setIsScanning] = useState(false)
  const router = useRouter()

  const handleProductFound = (product: ProductData) => {
    // Product is already saved to MongoDB by the BarcodeScanner component
    router.push('/dashboard')
  }

  return (
    <div className="relative min-h-screen bg-white">
      <Particles
        className="absolute inset-0"
        quantity={100}
        staticity={50}
        ease={50}
        color="#000000"
      />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg mb-2">Welcome to:</p>
        <h1 className="text-4xl font-bold mb-4">Hack-A-Food!</h1>
        <p className="text-gray-600 text-lg mb-8">Scan any packaged food barcode of your choice below!</p>
        {!isScanning ? (
          <Button 
            onClick={() => setIsScanning(true)} 
            size="lg"
            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3 text-lg"
          >
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
              className="mt-4 w-full border-gray-300 hover:bg-gray-100"
            >
              Cancel Scan
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

