"use client"

import { DashboardSection } from "@/app/components/dashboard-section"
import { EnvironmentSection } from "@/app/components/environment-section"
import { HealthSection } from "@/app/components/health-section"
import { IngredientsSection } from "@/app/components/ingredients-section"
import { PackagingSection } from "@/app/components/packaging-section"
import { PreferencesSection } from "@/app/components/preferences-section"
import { ProcessingSection } from "@/app/components/processing-section"
import { useRecentScan } from "@/hooks/use-recent-scan"

export default function DashboardPage() {
  const { data: productInfo, loading, error } = useRecentScan();

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  if (!productInfo) {
    return <div className="container mx-auto p-4">No product information available</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">{productInfo.name || 'Product Information'}</h1>

      <div className="flex flex-wrap -mx-2">
        <div className="w-full px-2 mb-4">
          <DashboardSection title="Matching with your preferences" defaultOpen>
            <PreferencesSection data={productInfo} />
          </DashboardSection>
        </div>

        <div className="w-full md:w-1/2 px-2 mb-4">
          <DashboardSection title="Health" defaultOpen>
            <HealthSection data={productInfo} />
          </DashboardSection>
        </div>

        <div className="w-full md:w-1/2 px-2 mb-4">
          <DashboardSection title="Ingredients" defaultOpen>
            <IngredientsSection data={productInfo} />
          </DashboardSection>
        </div>

        <div className="w-full md:w-1/2 px-2 mb-4">
          <DashboardSection title="Food processing">
            <ProcessingSection data={productInfo} />
          </DashboardSection>
        </div>

        <div className="w-full md:w-1/2 px-2 mb-4">
          <DashboardSection title="Environment">
            <EnvironmentSection data={productInfo} />
          </DashboardSection>
        </div>

        <div className="w-full md:w-1/2 px-2 mb-4">
          <DashboardSection title="Packaging">
            <PackagingSection data={productInfo} />
          </DashboardSection>
        </div>
      </div>
    </div>
  )
}
