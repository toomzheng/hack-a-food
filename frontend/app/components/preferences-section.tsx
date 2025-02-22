import { Check, Leaf } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function PreferencesSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1">
          <Leaf className="h-4 w-4" />
          <span>Green Score</span>
        </Badge>
        <Progress value={60} className="flex-1" />
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1">
          <Check className="h-4 w-4" />
          <span>Match Score</span>
        </Badge>
        <Progress value={75} className="flex-1" />
      </div>
    </div>
  )
}

