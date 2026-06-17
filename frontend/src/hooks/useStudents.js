import { useState, useEffect, useCallback } from "react";
import { studentsApi } from "../api";
import { useAuth } from "../context";

export function useStudents(initialParams = {}) {
  const { schoolId } = useAuth();
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(
    async (params = {}) => {
      if (!schoolId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await studentsApi.getAll(schoolId, {
          ...initialParams,
          ...params,
        });
        if (response.success) {
          setStudents(response.data.students || response.data);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch students");
      } finally {
        setLoading(false);
      }
    },
    [schoolId, initialParams],
  );

  const createStudent = useCallback(
    async (data) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await studentsApi.create(schoolId, data);
        if (response.success) {
          await fetchStudents();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to create student",
        };
      }
    },
    [schoolId, fetchStudents],
  );

  const updateStudent = useCallback(
    async (id, data) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await studentsApi.update(schoolId, id, data);
        if (response.success) {
          await fetchStudents();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update student",
        };
      }
    },
    [schoolId, fetchStudents],
  );

  const deleteStudent = useCallback(
    async (id) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await studentsApi.delete(schoolId, id);
        if (response.success) {
          await fetchStudents();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to delete student",
        };
      }
    },
    [schoolId, fetchStudents],
  );

  useEffect(() => {
    fetchStudents({
      search: initialParams.search,
      class_id: initialParams.classFilter || undefined,
    });
  }, [initialParams.classFilter]);

  return {
    students,
    pagination,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}

export function useStudent(id) {
  const { schoolId } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudent = useCallback(async () => {
    if (!schoolId || !id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await studentsApi.getById(schoolId, id);
      if (response.success) {
        setStudent(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch student");
    } finally {
      setLoading(false);
    }
  }, [schoolId, id]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  return { student, loading, error, refetch: fetchStudent };
}
