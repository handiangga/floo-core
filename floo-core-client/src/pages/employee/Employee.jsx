import { useState, useEffect } from "react";
import Layout from "../../components/layout/LayoutTest";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import EmployeeTable from "../../components/Employee/EmployeeTable";
import useEmployee from "../../hooks/useEmployee";
import api from "../../api/api";

export default function Employee() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const limit = 10;

  const { data, meta, loading, refetch } = useEmployee(
    page,
    limit,
    search,
    filter,
  );

  const navigate = useNavigate();

  // 🔥 reset page saat search/filter berubah
  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  // 🔥 delete handler (lebih aman)
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus?",
      text: "Data tidak bisa dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/employees/${id}`);

      Swal.fire("Berhasil", "Data dihapus", "success");

      // 🔥 handle pagination kosong
      if (data.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        refetch();
      }
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Tidak bisa hapus",
        "error",
      );
    }
  };

  return (
    <Layout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <p className="text-sm text-gray-400">Kelola data karyawan</p>
        </div>

        <button
          onClick={() => navigate("/employees/create")}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow-sm hover:bg-blue-700 transition"
        >
          + Tambah
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-3 mb-5">
        {/* 🔍 SEARCH */}
        <div className="relative w-full">
          <input
            placeholder="Cari nama karyawan..."
            className="w-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 px-4 py-2.5 rounded-xl outline-none transition pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* icon */}
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
            🔍
          </span>

          {/* loading */}
          {loading && (
            <span className="absolute right-3 top-2.5 text-xs text-gray-400">
              Searching...
            </span>
          )}
        </div>

        {/* FILTER */}
        <select
          className="border border-gray-200 focus:border-blue-500 px-4 py-2.5 rounded-xl outline-none transition"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Semua</option>
          <option value="staff">Staff</option>
          <option value="penjahit">Penjahit</option>
        </select>
      </div>

      {/* TABLE */}
      <EmployeeTable
        data={Array.isArray(data) ? data : []} // 🔥 defensive
        loading={loading}
        navigate={navigate}
        onDelete={handleDelete}
      />

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-5">
        {/* info */}
        <div className="text-sm text-gray-500">
          Page {meta?.page || 1} of {meta?.totalPages || 1}
        </div>

        {/* buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={!meta?.hasPrev}
            className="px-4 py-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-40 transition"
          >
            Prev
          </button>

          <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
            {meta?.page || 1}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!meta?.hasNext}
            className="px-4 py-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-40 transition"
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
}
