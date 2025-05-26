import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LightAnalyzeClient from './LightAnalyzeClient';

export const dynamic = 'force-dynamic';

export default async function LightAnalyzePage() {
  const session = await auth();
  
  if (!session) {
    redirect(`/login?next=/light-analyze`);
  }
  
  return <LightAnalyzeClient userEmail={session.user?.email || ''} />;
}
