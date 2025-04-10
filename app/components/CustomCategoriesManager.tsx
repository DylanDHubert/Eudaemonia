'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import CustomDropdown from './CustomDropdown';

interface CustomCategory {
  id: string;
  name: string;
  type: 'numeric' | 'scale' | 'boolean';
  userId: string;
  createdAt: string;
}

interface CustomCategoriesManagerProps {
  userId: string;
}

export default function CustomCategoriesManager({ userId }: CustomCategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [newCategory, setNewCategory] = useState<{
    name: string;
    type: 'numeric' | 'scale' | 'boolean';
  }>({
    name: '',
    type: 'numeric'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCategory,
          userId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create category');

      const createdCategory = await response.json();
      setCategories([...categories, createdCategory]);
      setNewCategory({ name: '', type: 'numeric' });
      toast.success('Category created successfully!');
      router.refresh();
    } catch (err) {
      setError('Failed to create category');
      toast.error('Failed to create category');
      console.error(err);
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');

      setCategories(categories.filter(cat => cat.id !== categoryId));
      toast.success('Category deleted successfully!');
      router.refresh();
    } catch (err) {
      setError('Failed to delete category');
      toast.error('Failed to delete category');
      console.error(err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-subheader mb-2">Add a New Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-subheader mb-1">
                Category Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="glass-input w-full text-input dark:text-white px-4 py-2.5"
                placeholder="e.g., Reading Time, Water Intake"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-subheader mb-1">
                Category Type
              </label>
              <CustomDropdown
                options={[
                  { value: 'numeric', label: 'Numeric (e.g., hours, count)' },
                  { value: 'scale', label: 'Scale (1-10)' },
                  { value: 'boolean', label: 'Yes/No' }
                ]}
                value={newCategory.type}
                onChange={(value) => setNewCategory({ ...newCategory, type: value as 'numeric' | 'scale' | 'boolean' })}
                placeholder="Select a type"
                className="w-full"
              />
            </div>
          </div>
          
          <button type="submit" className="glass-button w-full">
            Add Category
          </button>
        </form>
      </div>
      
      <div>
        <h2 className="text-subheader mb-4">Your Categories</h2>
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-description">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-description">You haven't created any custom categories yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {category.type === 'numeric' ? 'Numeric' : 
                       category.type === 'scale' ? 'Scale (1-10)' : 'Yes/No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {format(new Date(category.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 