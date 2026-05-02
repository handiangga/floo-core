import { useState, useEffect } from "react";
import api from "../api/api";
import Swal from "sweetalert2";

export default function useLoan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await api.get("/loans");

      console.log("LOAN RES:", res.data); // 🔥 debug

      setData(res?.data?.data || []);
    } catch (err) {
      console.error("LOAN ERROR:", err);
      Swal.fire("Error", "Gagal ambil loan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    refetch: fetchData,
  };
}
