import { useState, useCallback } from "react";
import { accountantApi } from "../api/accountant";

export function useAccountants() {
  const [accountants, setAccountants] = useState([]);
  const [selectedAccountant, setSelectedAccountant] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  // Get All Accountants
  const fetchAccountants = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    console.log(params);

    try {
      const response = await accountantApi.getAll(params);

      if (response.success) {
        setAccountants(response.data.accountants || response.data || []);
      }

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch accountants");

      return {
        success: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Accountant By ID
  const fetchAccountantById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await accountantApi.getById(id);

      if (response.success) {
        setSelectedAccountant(response.data);
      }

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch accountant");

      return {
        success: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create Accountant
  const createAccountant = useCallback(async (data) => {
    try {
      const response = await accountantApi.create(data);

      if (response.success) {
        setAccountants((prev) => [response.data, ...prev]);
      }

      return response;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to create accountant",
      };
    }
  }, []);

  // Update Accountant
  const updateAccountant = useCallback(async (id, data) => {
    try {
      const response = await accountantApi.update(id, data);

      if (response.success) {
        setAccountants((prev) =>
          prev.map((item) => (item.id === id ? response.data : item)),
        );
      }

      return response;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update accountant",
      };
    }
  }, []);

  // Delete Accountant
  const deleteAccountant = useCallback(async (id) => {
    try {
      const response = await accountantApi.delete(id);

      if (response.success) {
        setAccountants((prev) => prev.filter((item) => item.id !== id));
      }

      return response;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete accountant",
      };
    }
  }, []);

  return {
    accountants,
    selectedAccountant,
    loading,
    error,

    fetchAccountants,
    fetchAccountantById,

    createAccountant,
    updateAccountant,
    deleteAccountant,
  };
}
