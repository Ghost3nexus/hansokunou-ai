import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-static';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect(`/login?next=/dashboard`);
  }
  
  return <DashboardClient />;
}
