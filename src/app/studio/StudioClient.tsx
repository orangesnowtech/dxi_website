"use client";

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

const StudioWrapper = dynamic(
  () => import('./StudioWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading Sanity Studio...</p>
        </div>
      </div>
    ),
  }
)

interface StudioClientProps {
  config: any;
}

export default function StudioClient({ config }: StudioClientProps) {
  return (
    <div suppressHydrationWarning>
      <StudioWrapper config={config} />
    </div>
  )
}

