import { useState, useEffect, useCallback } from "react";
import { feesApi } from "../api";
import { useAuth } from "../context";

export function useFeeStructures() {
  const { schoolId } = useAuth();
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStructures = useCallback(
    async (params = {}) => {
      if (!schoolId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await feesApi.getStructures(schoolId, params);
        if (response.success) {
          setStructures(response.data?.feeStructures);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch fee structures",
        );
      } finally {
        setLoading(false);
      }
    },
    [schoolId],
  );

  const createStructure = useCallback(
    async (data) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await feesApi.createStructure(schoolId, data);
        if (response.success) {
          await fetchStructures();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message:
            err.response?.data?.message || "Failed to create fee structure",
        };
      }
    },
    [schoolId, fetchStructures],
  );

  useEffect(() => {
    fetchStructures({});
  }, []);

  return {
    structures,
    loading,
    error,
    fetchStructures,
    createStructure,
  };
}

export function useFeePayments() {
  const { schoolId } = useAuth();
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPayments = useCallback(
    async (params = {}) => {
      if (!schoolId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await feesApi.getPayments(schoolId, params);
        if (response.success) {
          setPayments(response.data.payments || response.data);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch payments");
      } finally {
        setLoading(false);
      }
    },
    [schoolId],
  );

  const createPayment = useCallback(
    async (data) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await feesApi.createPayment(schoolId, data);
        if (response.success) {
          await fetchPayments();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to create payment",
        };
      }
    },
    [schoolId, fetchPayments],
  );

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    pagination,
    loading,
    error,
    fetchPayments,
    createPayment,
  };
}
