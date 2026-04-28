import { useCallback, useEffect, useState } from "react";
import { getServices } from "../api/serviceApi";
import { mapServiceCollectionForUi } from "../utils/serviceMappers";

// Service hook centralizes fetching, loading state and optional UI mapping.
export function useServices({ categoryId = null, enabled = true, mapForUi = false } = {}) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState('');

  // Reload supports optional category override so pages can request a fresh filtered list.
  const reload = useCallback(async (nextCategoryId = categoryId) => {
    try {
      setLoading(true);
      setError('');
      const data = await getServices(nextCategoryId ?? undefined);
      const result = mapForUi ? mapServiceCollectionForUi(data) : (data || []);
      setServices(result);
      return result;
    } catch (err) {
      const message = err.message || 'Cannot load services.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categoryId, mapForUi]);

  // Initial fetch runs automatically unless the page disables the hook.
  useEffect(() => {
    if (!enabled) return;
    reload().catch(() => {});
  }, [enabled, reload]);

  return { services, setServices, loading, error, reload };
}
