import { AlertTriangle } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function ProcessingSection() {
  const additives = [
    "E500 - Sodium",
    "E500ii - Sodium",
    "E450 - Diphosphates",
    "E500 - Sodium carbonate",
    "E503 - Ammonium carbonates",
    "E322ii - Ammonium hydrogen carbonate",
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-4 w-4" />
          <span>Ultra processed foods</span>
        </Badge>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Additives</h3>
        <ul className="space-y-1">
          {additives.map((additive) => (
            <li key={additive} className="text-sm text-muted-foreground">
              {additive}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

