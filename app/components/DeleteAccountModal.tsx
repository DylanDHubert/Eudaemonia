'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-toastify';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [confirmation, setConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm', {
        position: "bottom-right",
        autoClose: 3000
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast.success('Account deleted successfully', {
        position: "bottom-right",
        autoClose: 3000
      });

      // SIGN OUT AND REDIRECT TO LOGIN
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.', {
        position: "bottom-right",
        autoClose: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="glass-card p-6 w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-header mb-4 text-gray-800 dark:text-gray-100">Delete Account</h2>
        <p className="text-description mb-6 text-gray-600 dark:text-gray-300">
          This action cannot be undone. All your data will be permanently deleted.
          Please type DELETE to confirm.
        </p>
        
        <input
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="Type DELETE"
          className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
        />
        
        <div className="flex space-x-4">
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Deleting...' : 'Delete Account'}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:focus:ring-indigo-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 