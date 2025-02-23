import { Box, Truck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { IProduct } from '../../lib/models/Product';

interface PackagingSectionProps {
  product: IProduct;
}

export function PackagingSection({ product }: PackagingSectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Packaging Score</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Box className="h-4 w-4" />
            <span>Medium Impact</span>
          </Badge>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Transportation</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Truck className="h-4 w-4" />
            <span>Local Distribution</span>
          </Badge>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-2">Recycling</h3>
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-blue-800">
            {product.labels.find(label => 
              label.toLowerCase().includes('recycl') || 
              label.toLowerCase().includes('packaging')
            ) || 'No recycling information available'}
          </p>
        </div>
      </div>
    </div>
  )
}
