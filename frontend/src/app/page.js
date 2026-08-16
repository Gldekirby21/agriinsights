'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('agri_token');
    if (token) router.replace('/dashboard');
    else router.replace('/login');
  }, [router]);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07120d' }}>
      <div className="loading-spinner" />
    </div>
  );
}
