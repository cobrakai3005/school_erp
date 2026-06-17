import { useState, useCallback } from "react";
import { salaryApi } from "../api";

export function useSalary(schoolId) {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalaries = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await salaryApi.getAll(schoolId);
      setSalaries(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch salaries");
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  const createSalary = useCallback(
    async (data) => {
      if (!schoolId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await salaryApi.create(schoolId, data);
        await fetchSalaries();
        return response.data;
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to create salary record",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [schoolId, fetchSalaries],
  );

  const updateSalary = useCallback(
    async (id, data) => {
      if (!schoolId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await salaryApi.update(schoolId, id, data);
        await fetchSalaries();
        return response.data;
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to update salary record",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [schoolId, fetchSalaries],
  );

  const deleteSalary = useCallback(
    async (id) => {
      if (!schoolId) return;
      setLoading(true);
      setError(null);
      try {
        await salaryApi.delete(schoolId, id);
        await fetchSalaries();
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to delete salary record",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [schoolId, fetchSalaries],
  );

  return {
    salaries,
    loading,
    error,
    fetchSalaries,
    createSalary,
    updateSalary,
    deleteSalary,
  };
}
