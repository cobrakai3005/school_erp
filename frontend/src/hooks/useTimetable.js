// src/hooks/useTimetable.js

import { useState, useCallback } from "react";
import { timetableApi } from "../api/timetable";

export function useTimetable() {
  const [timetables, setTimetables] = useState([]);

  const [selectedTimetable, setSelectedTimetable] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  // GET ALL

  const fetchTimetables = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await timetableApi.getAll(params);

      if (response.success) {
        // Check for 'timetable' (singular) as per your JSON
        const list =
          response.data?.timetable || response.data?.timetables || [];
        setTimetables(list);
      }

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch timetables");

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // GET BY ID

  const fetchTimetableById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await timetableApi.getById(id);

      if (response.success) {
        setSelectedTimetable(response.data);
      }

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch timetable");

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // GET BY CLASS

  const fetchByClass = useCallback(async (classId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await timetableApi.getByClass(classId);

      if (response.success) {
        // Check exactly where the array is.
        // Based on your JSON, it is response.data.timetable
        const list =
          response.data?.timetable ||
          response.data?.timetables ||
          response.data ||
          [];
        console.log("Timetable list set to hook state:", list); // DEBUG LOG
        setTimetables(list);
      }
      return response;
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch class timetable",
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // TEACHER TIMETABLE

  const fetchMyTimetable = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await timetableApi.getMyTimetable();

      if (response.success) {
        // Check for 'timetable' (singular) as per your JSON
        const list =
          response.data?.timetable || response.data?.timetables || [];
        setTimetables(list);
      }

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch my timetable");

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // STUDENT TIMETABLE

  const fetchStudentTimetable = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await timetableApi.getStudentTimetable();

      if (response.success) {
        setTimetables(response.data?.timetables || response.data || []);
      }

      return response;
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch student timetable",
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // CREATE

  const createTimetable = useCallback(async (data) => {
    setLoading(true);
    setError(null);

    try {
      const response = await timetableApi.create(data);

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create timetable");

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // UPDATE

  const updateTimetable = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);

    try {
      const response = await timetableApi.update(id, data);

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update timetable");

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // DELETE

  const deleteTimetable = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await timetableApi.delete(id);

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete timetable");

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // CLEAR CLASS TIMETABLE

  const clearClassTimetable = useCallback(async (classId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await timetableApi.clearByClass(classId);

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to clear timetable");

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    timetables,
    selectedTimetable,

    loading,
    error,

    fetchTimetables,
    fetchTimetableById,

    fetchByClass,

    fetchMyTimetable,
    fetchStudentTimetable,

    createTimetable,
    updateTimetable,
    deleteTimetable,

    clearClassTimetable,
  };
}
