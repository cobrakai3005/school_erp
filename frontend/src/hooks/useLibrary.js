import { useState, useEffect, useCallback } from "react";
import { libraryApi } from "../api";
import { useAuth } from "../context";

export function useLibraryBooks(initialParams = {}) {
  const { schoolId } = useAuth();
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(
    async (params = {}) => {
      if (!schoolId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await libraryApi.getBooks(schoolId, {
          ...initialParams,
          ...params,
        });
        if (response.success) {
          setBooks(response.data.books || response.data);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch books");
      } finally {
        setLoading(false);
      }
    },
    [schoolId, initialParams],
  );

  const createBook = useCallback(
    async (data) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await libraryApi.createBook(schoolId, data);
        if (response.success) {
          await fetchBooks();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to create book",
        };
      }
    },
    [schoolId, fetchBooks],
  );

  const updateBook = useCallback(
    async (id, data) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await libraryApi.updateBook(schoolId, id, data);
        if (response.success) {
          await fetchBooks();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update book",
        };
      }
    },
    [schoolId, fetchBooks],
  );

  const deleteBook = useCallback(
    async (id) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await libraryApi.deleteBook(schoolId, id);
        if (response.success) {
          await fetchBooks();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to delete book",
        };
      }
    },
    [schoolId, fetchBooks],
  );

  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    pagination,
    loading,
    error,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook,
  };
}

export function useLibraryIssues() {
  const { schoolId } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIssues = useCallback(
    async (params = {}) => {
      if (!schoolId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await libraryApi.getIssues(schoolId, params);
        if (response.success) {
          setIssues(response.data.issues || response.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch issues");
      } finally {
        setLoading(false);
      }
    },
    [schoolId],
  );

  const issueBook = useCallback(
    async (data) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await libraryApi.issueBook(schoolId, data);
        if (response.success) {
          await fetchIssues();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to issue book",
        };
      }
    },
    [schoolId, fetchIssues],
  );

  const returnBook = useCallback(
    async (issueId) => {
      if (!schoolId) return { success: false, message: "No school selected" };
      try {
        const response = await libraryApi.returnBook(schoolId, issueId);
        if (response.success) {
          await fetchIssues();
        }
        return response;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to return book",
        };
      }
    },
    [schoolId, fetchIssues],
  );

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return {
    issues,
    loading,
    error,
    fetchIssues,
    issueBook,
    returnBook,
  };
}
