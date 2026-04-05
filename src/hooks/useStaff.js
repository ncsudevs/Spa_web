import { useCallback, useEffect, useState } from "react";
import { getStaff } from "../api/staffApi";

export function useStaff({ enabled = true } = {}) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getStaff();
      setStaff(data || []);
      return data || [];
    } catch (err) {
      const message = err.message || "Cannot load staff.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    reload().catch(() => {});
  }, [enabled, reload]);

  return { staff, setStaff, loading, error, reload };
}
