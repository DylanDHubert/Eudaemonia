'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface CustomCategory {
  id: string;
  name: string;
  type: 'numeric' | 'scale' | 'boolean';
  userId: string;
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Category Name
          </label>
          <input
            type="text"
            id="name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="type"
            value={newCategory.type}
            onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'numeric' | 'scale' | 'boolean' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="numeric">Numeric</option>
            <option value="scale">Scale (1-10)</option>
            <option value="boolean">Yes/No</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Categories</h3>
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
            >
              <div>
                <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                <p className="text-sm text-gray-500">
                  Type: {category.type === 'scale' ? 'Scale (1-10)' : 
                        category.type === 'boolean' ? 'Yes/No' : 'Numeric'}
                </p>
              </div>
              <button
                onClick={() => handleDelete(category.id)}
                className="text-red-600 hover:text-red-800"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-gray-500 text-sm">No custom categories yet. Add one above!</p>
          )}
        </div>
      </div>
    </div>
  );
} 