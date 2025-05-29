import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AnalyzeClient from './AnalyzeClient';

export const dynamic = 'force-static';

export default async function AnalyzePage() {
  const session = await auth();
  
  if (!session) {
    redirect(`/login?next=/analyze`);
  }
  
  return <AnalyzeClient />;
}
