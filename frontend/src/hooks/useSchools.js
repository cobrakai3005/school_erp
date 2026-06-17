import { useState, useEffect, useCallback } from "react";
import { schoolsApi } from "../api";

export function useSchools(initialParams = {}) {
  const [schools, setSchools] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchools = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const response = await schoolsApi.getAll({
          ...initialParams,
          ...params,
        });
        if (response.success) {
          setSchools(response.data.schools || response.data);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch schools");
      } finally {
        setLoading(false);
      }
    },
    [initialParams],
  );

  const createSchool = useCallback(
    async (data) => {
      try {
        const response = await schoolsApi.create(data);
        if (response.success) {
          await fetchSchools();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to create school",
        };
      }
    },
    [fetchSchools],
  );

  const updateSchool = useCallback(
    async (id, data) => {
      try {
        const response = await schoolsApi.update(id, data);
        if (response.success) {
          await fetchSchools();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update school",
        };
      }
    },
    [fetchSchools],
  );

  const deleteSchool = useCallback(
    async (id) => {
      try {
        const response = await schoolsApi.delete(id);
        if (response.success) {
          await fetchSchools();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to delete school",
        };
      }
    },
    [fetchSchools],
  );

  useEffect(() => {
    fetchSchools();
  }, []);

  return {
    schools,
    pagination,
    loading,
    error,
    fetchSchools,
    createSchool,
    updateSchool,
    deleteSchool,
  };
}
