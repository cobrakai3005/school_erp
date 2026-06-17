import { useState, useEffect, useCallback } from "react";
import { homeworkApi } from "../api";
import { useAuth } from "../context";

export function useHomework(initialParams = {}) {
  const [homework, setHomework] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const fetchHomework = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        let response;
        switch (user.user_type) {
          case "student":
            response = await homeworkApi.getByClass(user.class_id);
            break;

          case "teacher":
            response = await homeworkApi.getByTeacher(user.teacher_id);
            break;

          case "admin":
            response = await homeworkApi.getAll();
            break;

          default:
            response = await homeworkApi.getAll();
            break;
        }

        console.log(response, "response");

        if (response.success) {
          setHomework(response.data.homework || response.data);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch homework");
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const createHomework = useCallback(
    async (data, file) => {
      try {
        const response = await homeworkApi.create(data, file);
        if (response.success) {
          await fetchHomework();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to create homework",
        };
      }
    },
    [fetchHomework],
  );

  const updateHomework = useCallback(
    async (id, data) => {
      try {
        const response = await homeworkApi.update(id, data);
        if (response.success) {
          await fetchHomework();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update homework",
        };
      }
    },
    [fetchHomework],
  );

  const deleteHomework = useCallback(
    async (id) => {
      try {
        const response = await homeworkApi.delete(id);
        if (response.success) {
          await fetchHomework();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to delete homework",
        };
      }
    },
    [fetchHomework],
  );

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  return {
    homework,
    pagination,
    loading,
    error,
    fetchHomework,
    createHomework,
    updateHomework,
    deleteHomework,
  };
}
