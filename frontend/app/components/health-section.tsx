import { Scale } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export function HealthSection() {
  const nutritionFacts = [
    { name: "Fat", value: "42%", color: "bg-red-500" },
    { name: "Saturated fat", value: "38%", color: "bg-red-500" },
    { name: "Carbohydrates", value: "45%", color: "bg-yellow-500" },
    { name: "Sugars", value: "28%", color: "bg-green-500" },
    { name: "Fiber", value: "12%", color: "bg-green-500" },
    { name: "Proteins", value: "15%", color: "bg-green-500" },
    { name: "Salt", value: "58%", color: "bg-red-500" },
    { name: "Sodium", value: "58%", color: "bg-red-500" },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Nutrition Score</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Scale className="h-4 w-4" />
            <span>Nutri-Score E</span>
          </Badge>
          <Progress value={20} className="flex-1" />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Nutrient levels</h3>
        <div className="grid gap-3">
          {nutritionFacts.map((fact) => (
            <div key={fact.name} className="flex items-center gap-2">
              <span className="w-32 text-sm">{fact.name}</span>
              <div className={`h-2 w-2 rounded-full ${fact.color}`} />
              <span className="text-sm text-muted-foreground">{fact.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

