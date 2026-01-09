import React from 'react'
import { Spinner } from '@/components/ui/spinner'

function SpinnerComponent() {
  return (
    <div className="spinner-container flex justify-center items-center h-full min-h-screen">
      <Spinner className="h-6 w-6" />
    </div>
  )
}

export default SpinnerComponent