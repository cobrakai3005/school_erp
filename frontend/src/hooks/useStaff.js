import { useState, useCallback } from "react";
import { staffApi } from "../api";
import { useAuth } from "../context";

export function useStaff() {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [staffCounts, setStaffCounts] = useState(null);
  const { school } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get All Staff
  const fetchAllStaff = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await staffApi.getAll(school.id, params);

      if (response.success) {
        setStaff(response.data.staff || response.data || []);
      }

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch staff");

      return {
        success: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Staff Counts
  const fetchStaffCounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await staffApi.getCounts();

      if (response.success) {
        setStaffCounts(response.data);
      }

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch staff counts");

      return {
        success: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Staff By ID
  const fetchStaffById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await staffApi.getById(id);

      if (response.success) {
        setSelectedStaff(response.data);
      }

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch staff details");

      return {
        success: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Staff Salary History
  const fetchStaffSalaryHistory = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await staffApi.getSalaryHistory(id);

      if (response.success) {
        setSalaryHistory(response.data || []);
      }

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch salary history");

      return {
        success: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    staff,
    selectedStaff,
    salaryHistory,
    staffCounts,
    loading,
    error,

    fetchAllStaff,
    fetchStaffCounts,
    fetchStaffById,
    fetchStaffSalaryHistory,
  };
}
