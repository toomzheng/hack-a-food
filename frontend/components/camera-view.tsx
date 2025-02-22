'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import jsQR from 'jsqr'

interface CameraViewProps {
  onScan: (imageData: string) => void
  onClose: () => void
}

export function CameraView({ onScan, onClose }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string>('')
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    let mounted = true
    let animationFrame: number

    async function setupCamera() {
      try {
        if (!videoRef.current || !canvasRef.current) return

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        })
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        streamRef.current = stream
        videoRef.current.srcObject = stream

        await videoRef.current.play().catch((err) => {
          console.error('Error playing video:', err)
          if (err.name === 'AbortError') {
            setTimeout(() => {
              if (videoRef.current && mounted) {
                videoRef.current.play().catch(console.error)
              }
            }, 100)
          }
        })

        // Start scanning loop
        scanQRCode()
      } catch (err) {
        if (mounted) {
          setError('Could not access camera. Please make sure you have granted camera permissions.')
          console.error('Camera setup error:', err)
        }
      }
    }

    function scanQRCode() {
      if (!videoRef.current || !canvasRef.current || !scanning) return

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (!context) return

      // Set canvas size to match video
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight

      // Draw current video frame to canvas
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

      // Get image data for scanning
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      // Attempt to find QR code in image
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        // Found a QR code
        setScanning(false)
        const capturedImage = canvas.toDataURL('image/jpeg')
        onScan(capturedImage)
        return
      }

      // Continue scanning
      animationFrame = requestAnimationFrame(scanQRCode)
    }

    setupCamera()

    return () => {
      mounted = false
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [scanning, onScan])

  const handleClose = () => {
    setScanning(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    onClose()
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg max-w-md">
          <h3 className="text-lg font-semibold text-red-600">Error</h3>
          <p className="mt-2">{error}</p>
          <Button onClick={handleClose} className="mt-4">Close</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-h-[80vh] rounded-lg"
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-white rounded-lg"></div>
            </div>
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
