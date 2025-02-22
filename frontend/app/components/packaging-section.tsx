import { Box, Truck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function PackagingSection() {
  const materials = [
    { name: "Plastic", weight: "10.5g", percentage: "85%" },
    { name: "Paper", weight: "2.1g", percentage: "15%" },
  ]

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
        <h3 className="font-medium">Packaging Materials</h3>
        <div className="space-y-2">
          {materials.map((material) => (
            <div key={material.name} className="flex items-center justify-between text-sm">
              <span>{material.name}</span>
              <span className="text-muted-foreground">
                {material.weight} ({material.percentage})
              </span>
            </div>
          ))}
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
    </div>
  )
}

