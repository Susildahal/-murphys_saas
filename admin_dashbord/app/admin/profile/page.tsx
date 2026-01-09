import React, { Suspense } from 'react';
import ProfileUpdateForm from '@/app/page/profileUpdateForm';
import SpinnerComponent from '@/app/page/common/Spinner';

export default function Page() {
  return (
    <>
      <Suspense fallback={<div className="flex items-center justify-center p-8"><SpinnerComponent /></div>}>
        {/* ProfileUpdateForm is a client component that uses useSearchParams; wrap in Suspense to avoid CSR bailout */}
        <ProfileUpdateForm />
      </Suspense>
    </>
  );
}