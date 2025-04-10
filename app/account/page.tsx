import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AccountManagement from './AccountManagement';

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Account Management</h1>
      <AccountManagement user={session.user} />
    </div>
  );
} 