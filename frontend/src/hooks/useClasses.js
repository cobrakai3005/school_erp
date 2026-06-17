import { useState, useEffect, useCallback } from "react";
import { classesApi } from "../api";
import { useAuth } from "../context";

export function useClasses(initialParams = {}) {
  const { schoolId } = useAuth();
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClasses = useCallback(
    async (params = {}) => {
      if (!schoolId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await classesApi.getAll(schoolId, {
          ...initialParams,
          ...params,
        });
        if (response.success) {
          setClasses(response.data.classes || response.data);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch classes");
      } finally {
        setLoading(false);
      }
    },
    [schoolId, initialParams],
  );

  const createClass = useCallback(
    async (data) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await classesApi.create(schoolId, data);
        if (response.success) {
          await fetchClasses();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to create class",
        };
      }
    },
    [schoolId, fetchClasses],
  );

  const updateClass = useCallback(
    async (id, data) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await classesApi.update(schoolId, id, data);
        if (response.success) {
          await fetchClasses();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update class",
        };
      }
    },
    [schoolId, fetchClasses],
  );

  const deleteClass = useCallback(
    async (id) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await classesApi.delete(schoolId, id);
        if (response.success) {
          await fetchClasses();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to delete class",
        };
      }
    },
    [schoolId, fetchClasses],
  );

  useEffect(() => {
    fetchClasses();
  }, []);

  return {
    classes,
    pagination,
    loading,
    error,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
  };
}
