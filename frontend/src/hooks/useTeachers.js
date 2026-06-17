import { useState, useEffect, useCallback } from "react";
import { teachersApi } from "../api";
import { useAuth } from "../context";

export function useTeachers(initialParams = {}) {
  const { schoolId } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeachers = useCallback(
    async (params = {}) => {
      if (!schoolId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await teachersApi.getAll(schoolId, {
          ...initialParams,
          ...params,
        });
        if (response.success) {
          setTeachers(response.data.teachers || response.data);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch teachers");
      } finally {
        setLoading(false);
      }
    },
    [schoolId],
  );

  const createTeacher = useCallback(
    async (data) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await teachersApi.create(schoolId, data);
        if (response.success) {
          await fetchTeachers();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to create teacher",
        };
      }
    },
    [schoolId, fetchTeachers],
  );

  const updateTeacher = useCallback(
    async (id, data) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await teachersApi.update(schoolId, id, data);
        if (response.success) {
          await fetchTeachers();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update teacher",
        };
      }
    },
    [schoolId, fetchTeachers],
  );

  const deleteTeacher = useCallback(
    async (id) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await teachersApi.delete(schoolId, id);
        if (response.success) {
          await fetchTeachers();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to delete teacher",
        };
      }
    },
    [schoolId, fetchTeachers],
  );

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    pagination,
    loading,
    error,
    fetchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
  };
}
