'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the root page which now contains the dashboard
    router.replace('/');
  }, [router]);
  
  // Return empty div while redirecting
  return <div></div>;
}