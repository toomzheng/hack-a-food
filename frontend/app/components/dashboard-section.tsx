"use client"

import { ChevronUp } from "lucide-react"
import { useState } from "react"
import type * as React from "react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface DashboardSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function DashboardSection({ title, children, defaultOpen = false, className }: DashboardSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div
      className={cn(
        "bg-white rounded-lg overflow-hidden transition-all duration-300",
        isOpen ? "border shadow-sm" : "border-t border-l border-r",
        className,
      )}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-3 font-medium bg-gray-50">
          {title}
          <ChevronUp className={cn("h-4 w-4 transition-transform duration-300", isOpen ? "rotate-180" : "")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
          <div className="p-3">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

