import { useCallback, useEffect, useState } from 'react';
import { getCategories } from '../api/serviceCategoryApi';

// Category hook keeps category fetch logic separate from page rendering logic.
export function useServiceCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reload can be reused after create, update or delete actions in admin pages.
  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCategories();
      setCategories(data || []);
      return data || [];
    } catch (err) {
      const message = err.message || 'Cannot load categories.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial category fetch keeps filter dropdowns and forms ready on first render.
  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  return { categories, setCategories, loading, error, reload };
}
