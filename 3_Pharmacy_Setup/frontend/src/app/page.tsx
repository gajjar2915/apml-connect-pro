'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/pharmacy');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
      <p>Redirecting to Pharmacy Hub...</p>
    </div>
  );
}
