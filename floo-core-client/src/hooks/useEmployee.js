import { useState, useEffect } from "react";
import api from "../api/api";
import Swal from "sweetalert2";

// 🔥 debounce helper
const useDebounce = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => clearTimeout(timer);
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
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 400);

  const fetchData = async () => {
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

      // 🔥 FIX UTAMA (NESTED DATA)
      const employees = Array.isArray(res?.data?.data?.data)
        ? res.data.data.data
        : [];

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

      setData([]);
      setMeta({
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, debouncedSearch, filter]);

  return {
    data,
    meta,
    loading,
    refetch: fetchData,
  };
}
