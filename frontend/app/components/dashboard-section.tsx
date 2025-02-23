"use client"

import { ChevronDown } from "lucide-react"
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
    <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      
      <div
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

