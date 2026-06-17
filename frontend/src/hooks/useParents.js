import { useState, useEffect, useCallback } from "react";
import parentService from "../api/parents";
import { useAuth } from "../context/AuthContext";

/**
 * Hook to fetch and manage the list of parents
 */
export const useParents = () => {
  const { school } = useAuth();
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchParents = useCallback(async () => {
    if (!school?.id) return;
    setLoading(true);
    try {
      const data = await parentService.getAllParents(school?.id);

      setParents(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch parents");
    } finally {
      setLoading(false);
    }
  }, [school?.id]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  return { parents, loading, error, refresh: fetchParents };
};

/**
 * Hook for parent operations (Create, Update, Delete)
 */
export const useParentActions = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const addParent = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await parentService.createParent(data);
      setActionError(null);
      return result;
    } catch (err) {
      setActionError(err.response?.data?.error || "Failed to create parent");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const editParent = async (id, data) => {
    setIsSubmitting(true);
    try {
      const result = await parentService.updateParent(id, data);
      setActionError(null);
      return result;
    } catch (err) {
      setActionError(err.response?.data?.error || "Failed to update parent");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeParent = async (id) => {
    setIsSubmitting(true);
    try {
      await parentService.deleteParent(id);
      setActionError(null);
    } catch (err) {
      setActionError(err.response?.data?.error || "Failed to delete parent");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { addParent, editParent, removeParent, isSubmitting, actionError };
};
