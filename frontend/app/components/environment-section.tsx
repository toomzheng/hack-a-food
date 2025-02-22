import { Leaf } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function EnvironmentSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1">
          <Leaf className="h-4 w-4" />
          <span>Eco-Score C</span>
        </Badge>
        <Progress value={40} className="flex-1" />
      </div>
    </div>
  )
}

