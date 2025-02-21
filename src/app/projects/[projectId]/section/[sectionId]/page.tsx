// src/app/projects/[projectId]/section/[sectionId]/page.tsx
'use client'

import { Suspense, use } from 'react'
import { SectionContent } from './section-content'
import  { getSectionData } from '@/lib/audit-data' //auditData,
import { Card } from '@/components/ui/card'
import { Section, ScoreSummary, Item } from '@/types/audit'

interface PageProps {
  params: Promise<{
    projectId: string
    sectionId: string
  }>
}

interface SectionWithItems extends Section {
  items: Item[]
}

// interface SectionData {
//   scoreSummary: ScoreSummary | undefined
//   sections: SectionWithItems[] | undefined
// }

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
          <div className="h-8 bg-gray-100 rounded animate-pulse w-64" />
        </div>
      </Card>
    </div>
  )
}

export default function Page({ params }: PageProps) {
  const resolvedParams = use(params)
  console.log('Section Page Params:', resolvedParams)
  
  const sectionData = getSectionData(resolvedParams.sectionId)
  console.log('Section Data:', sectionData)

  if (!sectionData || !sectionData.scoreSummary || !sectionData.sections) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-6 w-full max-w-2xl mx-4">
          <div className="space-y-4">
            <div className="text-lg text-red-600 text-center">
              Section not found - Invalid section ID: {resolvedParams.sectionId}
            </div>
            <button
              onClick={() => window.history.back()}
              className="w-full py-2 text-sm text-blue-600 hover:text-blue-800"
            >
              ← Go Back
            </button>
          </div>
        </Card>
      </div>
    )
  }

  const validSectionData = {
    scoreSummary: sectionData.scoreSummary,
    sections: sectionData.sections
  }
  
  return (
    <Suspense fallback={<LoadingState />}>
      <SectionContent 
        sectionData={validSectionData}
        projectId={resolvedParams.projectId}
      />
    </Suspense>
  )
}