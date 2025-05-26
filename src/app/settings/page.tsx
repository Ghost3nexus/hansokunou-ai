import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session) {
    redirect(`/login?next=/settings`);
  }
  
  return <SettingsClient />;
}
