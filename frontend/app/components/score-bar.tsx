import { Leaf, Check } from "lucide-react"

interface ScoreBarProps {
  type: 'green' | 'match';
  score: number; // 0-100
  label: string;
}

export function ScoreBar({ type, score, label }: ScoreBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
          {type === 'green' ? (
            <Leaf className="w-4 h-4 text-green-600" />
          ) : (
            <Check className="w-4 h-4 text-blue-600" />
          )}
          <span className="text-sm font-medium">{label}</span>
        </div>
      </div>
      <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`absolute left-0 top-0 h-full rounded-full ${
            type === 'green' ? 'bg-green-600' : 'bg-blue-600'
          }`}
          style={{ width: `${score}%` }}
        />
        <div 
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium"
          style={{ color: score > 80 ? 'white' : 'black' }}
        >
          {score}%
        </div>
      </div>
    </div>
  );
} 