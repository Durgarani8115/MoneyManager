import React, { Suspense } from 'react'
import { BarLoader } from 'react-spinners'

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }) {
  return (
    <div className="w-full">
      <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#18181b" />}>
        {children}
      </Suspense>
    </div>
  )
}