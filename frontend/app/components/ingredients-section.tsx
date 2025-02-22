import { CircleDot } from "lucide-react"

export function IngredientsSection() {
  const ingredients = [
    "Cereals 65.7%",
    "Wheat flour 62.1%",
    "Whole wheat flour 32.1%",
    "Sugar (20.4% estimated)",
    "Vegetable oil 16.7% (estimated)",
    "Palm oil 84% (estimated)",
    "Glucose syrup 7.2% (estimated)",
    "Wheat starch 2.6% (estimated)",
    "Raising agents < 2% (estimated)",
    "E500ii < 2% (estimated)",
    "E503 < 2% (estimated)",
    "Emulsifier < 2% (estimated)",
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <CircleDot className="h-5 w-5 mt-0.5 text-muted-foreground" />
        <div>
          <span className="font-medium">23 Ingredients</span>
          <ul className="mt-2 space-y-1">
            {ingredients.map((ingredient) => (
              <li key={ingredient} className="text-sm text-muted-foreground">
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

