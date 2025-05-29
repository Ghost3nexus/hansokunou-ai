import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-static';

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session) {
    redirect(`/login?next=/settings`);
  }
  
  return <SettingsClient />;
}
