import { useState, useEffect, useCallback } from "react";
import { attendanceApi } from "../api";

export function useAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchByClass = useCallback(async (classId, date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceApi.getByClass(classId, date);
      if (response.success) {
        setAttendance(response.data);
      }
      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch attendance");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByStudent = useCallback(async (studentId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceApi.getByStudent(studentId, params);
      if (response.success) {
        setAttendance(response.data);
      }
      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch attendance");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const markAttendance = useCallback(async (data) => {
    try {
      const response = await attendanceApi.mark(data);
      return response;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to mark attendance",
      };
    }
  }, []);

  const markBulkAttendance = useCallback(async (data) => {
    try {
      console.log(data);

      const response = await attendanceApi.markBulk(data);
      return response;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to mark attendance",
      };
    }
  }, []);

  return {
    attendance,
    loading,
    error,
    fetchByClass,
    fetchByStudent,
    markAttendance,
    markBulkAttendance,
  };
}
