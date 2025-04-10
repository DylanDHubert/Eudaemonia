'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { User } from 'next-auth';

interface AccountManagementProps {
  user: User;
}

export default function AccountManagement({ user }: AccountManagementProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Sign out after successful deletion
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting your account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-lg">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Account Information</h2>
        <p className="text-gray-600 dark:text-gray-300">Email: {user.email}</p>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Danger Zone</h2>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Delete Account</h3>
          <p className="text-red-600 dark:text-red-300 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          {error && (
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          )}
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
} 