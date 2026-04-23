import { useState, useEffect, useCallback } from "react";
import api from "../api/api";
import Swal from "sweetalert2";

// debounce
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
};

export default function useEmployee(page, limit, search, filter) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(search);

  // 🔥 useCallback biar stabil (INI KUNCI)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/employees", {
        params: {
          page,
          limit,
          search: debouncedSearch,
          position: filter,
        },
      });

      const employees = res?.data?.data?.data || [];
      const metaData = res?.data?.data?.meta || {};

      setData(employees);

      setMeta({
        page: metaData.page || 1,
        totalPages: metaData.totalPages || 1,
        hasNext: metaData.hasNext || false,
        hasPrev: metaData.hasPrev || false,
      });
    } catch (err) {
      console.error("FETCH ERROR:", err);
      Swal.fire("Error", "Gagal ambil data", "error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filter]);

  // 🔥 clean effect (no loop)
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    meta,
    loading,
    refetch: fetchData,
  };
}
