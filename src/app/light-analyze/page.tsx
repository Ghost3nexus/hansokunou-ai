"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LightAnalyzeClient from './LightAnalyzeClient';

export default function LightAnalyzePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?next=/light-analyze`);
    }
  }, [status, router]);
  
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!session) {
    return null;
  }
  
  return <LightAnalyzeClient userEmail={session.user?.email || ''} />;
}
