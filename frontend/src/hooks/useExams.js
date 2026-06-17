import { useState, useEffect, useCallback } from "react";
import { examsApi } from "../api";
import { useAuth } from "../context";

export function useExams(initialParams = {}) {
  const { schoolId } = useAuth();
  const [exams, setExams] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExams = useCallback(
    async (params = {}) => {
      if (!schoolId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await examsApi.getAll(schoolId, {
          ...initialParams,
          ...params,
        });
        if (response.success) {
          setExams(response.data.exams || response.data);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch exams");
      } finally {
        setLoading(false);
      }
    },
    [schoolId, initialParams],
  );

  const createExam = useCallback(
    async (data) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await examsApi.create(schoolId, data);
        if (response.success) {
          await fetchExams();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to create exam",
        };
      }
    },
    [schoolId, fetchExams],
  );

  const updateExam = useCallback(
    async (id, data) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await examsApi.update(schoolId, id, data);
        if (response.success) {
          await fetchExams();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update exam",
        };
      }
    },
    [schoolId, fetchExams],
  );

  const deleteExam = useCallback(
    async (id) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await examsApi.delete(schoolId, id);
        if (response.success) {
          await fetchExams();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to delete exam",
        };
      }
    },
    [schoolId, fetchExams],
  );

  useEffect(() => {
    fetchExams();
  }, []);

  return {
    exams,
    pagination,
    loading,
    error,
    fetchExams,
    createExam,
    updateExam,
    deleteExam,
  };
}
