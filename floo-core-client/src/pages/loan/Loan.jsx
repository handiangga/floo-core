import { useState, useMemo } from "react";
import Layout from "../../components/layout/LayoutTest";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import useLoan from "../../hooks/useLoan";
import LoanTable from "../../components/Loan/LoanTable";
import api from "../../api/api";
import { formatRupiah } from "../../utils/format";
import { getUser } from "../../utils/auth";

export default function Loan() {
  const { data = [], loading, refetch } = useLoan();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const user = getUser();

  // 🔥 NORMALIZE (ANTI NULL / STRING)
  const normalize = (val) => {
    if (val === null || val === undefined) return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  // 🔥 FILTER
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.Employee?.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [data, search]);

  // 🔥 SUMMARY
  const summary = useMemo(() => {
    let total = 0;
    let remaining = 0;
    let active = 0;
    let paid = 0;

    data.forEach((loan) => {
      const t = normalize(loan.total_amount);
      const r = normalize(loan.remaining_amount);

      total += t;
      remaining += r;

      if (r > 0) active++;
      else paid++;
    });

    return { total, remaining, active, paid };
  }, [data]);

  // 🔥 DELETE API HELPER
  const deleteLoanAPI = async (id) => {
    try {
      await api.delete(`/loans/${id}`);
      Swal.fire("Berhasil", "Loan dihapus", "success");
      refetch();
    } catch {
      Swal.fire("Error", "Gagal hapus", "error");
    }
  };

  // 🔥 DELETE LOGIC (FINAL STABLE)
  const handleDelete = async (loan) => {
    const total = normalize(loan.total_amount);
    const remaining = normalize(loan.remaining_amount);

    // ❌ DATA INVALID
    if (total <= 0) {
      return Swal.fire({
        icon: "error",
        title: "Data bermasalah",
        text: "Total loan tidak valid",
      });
    }

    const isLunas = remaining === 0;
    const belumCicilan = remaining === total;
    const sudahNyicil = remaining > 0 && remaining < total;

    // ❌ SUDAH NYICIL
    if (sudahNyicil) {
      return Swal.fire({
        icon: "warning",
        title: "Tidak bisa dihapus",
        text: "Loan sudah memiliki cicilan",
      });
    }

    // ⚠️ BELUM CICILAN
    if (belumCicilan) {
      const confirm = await Swal.fire({
        title: "Hapus loan?",
        text: "Belum ada cicilan",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
      });

      if (!confirm.isConfirmed) return;

      return deleteLoanAPI(loan.id);
    }

    // ✅ LUNAS
    if (isLunas) {
      const confirm = await Swal.fire({
        title: "Hapus loan?",
        text: "Loan sudah lunas",
        icon: "question",
        showCancelButton: true,
      });

      if (!confirm.isConfirmed) return;

      return deleteLoanAPI(loan.id);
    }
  };

  return (
    <Layout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Loans</h1>

        {user?.role === "admin" && (
          <button
            onClick={() => navigate("/loans/create")}
            className="bg-blue-500 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-600 transition"
          >
            + Tambah Loan
          </button>
        )}
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card title="Total" value={formatRupiah(summary.total)} />
        <Card
          title="Outstanding"
          value={formatRupiah(summary.remaining)}
          color="text-red-500"
        />
        <Card title="Aktif" value={summary.active} color="text-yellow-500" />
        <Card title="Lunas" value={summary.paid} color="text-green-600" />
      </div>

      {/* SEARCH */}
      <input
        placeholder="Cari karyawan..."
        className="w-full border px-4 py-2 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <LoanTable
        data={filteredData}
        loading={loading}
        navigate={navigate}
        onDelete={handleDelete}
      />
    </Layout>
  );
}

// 🔥 CARD COMPONENT
function Card({ title, value, color = "" }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow hover:shadow-md transition">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
