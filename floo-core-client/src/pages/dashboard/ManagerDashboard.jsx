import { useEffect, useState } from "react";

import Layout from "../../components/layout/LayoutTest";

import api from "../../api/api";

import Swal from "sweetalert2";

import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Wallet,
  AlertTriangle,
} from "lucide-react";

import FinanceCard from "../../components/ui/FinanceCard";

export default function ManagerDashboard() {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // 🔥 FETCH DASHBOARD
  // =====================================================
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      setError("");

      const res = await api.get("/dashboard/manager");

      setData(res.data.data);
    } catch (err) {
      console.error(err);

      setError("Gagal load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // 🔥 APPROVE MANAGER
  // =====================================================
  const handleApprove = async (id) => {
    try {
      const confirm = await Swal.fire({
        title: "Approve pinjaman?",
        text: "Pengajuan akan diteruskan ke owner",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Approve",
      });

      if (!confirm.isConfirmed) return;

      await api.post(`/loans/${id}/approve-manager`);

      Swal.fire("Berhasil", "Pengajuan diteruskan ke owner", "success");

      fetchDashboard();
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Error",
        err?.response?.data?.message || "Gagal approve",
        "error",
      );
    }
  };

  // =====================================================
  // 🔥 REJECT MANAGER
  // =====================================================
  const handleReject = async (id) => {
    try {
      const { value: reason } = await Swal.fire({
        title: "Reject pinjaman",
        input: "textarea",
        inputLabel: "Alasan reject",
        inputPlaceholder: "Masukkan alasan reject...",
        inputAttributes: {
          "aria-label": "Alasan reject",
        },
        showCancelButton: true,
        confirmButtonText: "Reject",
        confirmButtonColor: "#ef4444",
      });

      // batal
      if (!reason) return;

      await api.post(`/loans/${id}/reject-manager`, {
        reason,
      });

      Swal.fire("Berhasil", "Pengajuan ditolak", "success");

      fetchDashboard();
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Error",
        err?.response?.data?.message || "Gagal reject",
        "error",
      );
    }
  };

  // =====================================================
  // 🔥 HELPER
  // =====================================================
  const s = data?.summary || {};

  const safe = (v) => Number(v) || 0;

  // =====================================================
  // 🔥 KPI CARDS
  // =====================================================
  const financeCards = [
    {
      title: "Pending Approval",
      value: safe(s.pendingApproval),
      icon: ClipboardCheck,
      color: "from-yellow-400 to-yellow-500",
      isMoney: false,
    },

    {
      title: "Approved",
      value: safe(s.approvedLoans),
      icon: CheckCircle,
      color: "from-green-400 to-green-500",
      isMoney: false,
    },

    {
      title: "Rejected",
      value: safe(s.rejectedLoans),
      icon: XCircle,
      color: "from-red-400 to-red-500",
      isMoney: false,
    },

    {
      title: "Active Loan",
      value: safe(s.activeLoans),
      icon: Wallet,
      color: "from-blue-400 to-blue-500",
      isMoney: false,
    },
  ];

  // =====================================================
  // 🔥 LOADING
  // =====================================================
  if (loading) {
    return (
      <Layout>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </Layout>
    );
  }

  // =====================================================
  // 🔥 ERROR
  // =====================================================
  if (error) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>

          <button
            onClick={fetchDashboard}
            className="mt-3 px-4 py-2 rounded bg-black text-white"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ================================================= */}
      {/* 🔥 HEADER */}
      {/* ================================================= */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manager Dashboard</h1>

          <p className="text-sm text-gray-500">
            Approval & monitoring pinjaman
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
        >
          Refresh
        </button>
      </div>

      {/* ================================================= */}
      {/* 🔥 KPI */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {financeCards.map((item, i) => (
          <FinanceCard key={i} {...item} />
        ))}
      </div>

      {/* ================================================= */}
      {/* 🔥 PENDING APPROVAL */}
      {/* ================================================= */}
      <div className="mt-8 bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-lg">Pending Approval</h2>

            <p className="text-sm text-gray-500">
              Pengajuan menunggu approval manager
            </p>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Nama</th>

                <th className="text-left py-3">Nominal</th>

                <th className="text-left py-3">Tenor</th>

                <th className="text-left py-3">Status</th>

                <th className="text-right py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {data?.pendingApprovals?.length > 0 ? (
                data.pendingApprovals.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-4">{item.employee}</td>

                    <td className="py-4">
                      Rp {safe(item.amount).toLocaleString("id-ID")}
                    </td>

                    <td className="py-4">{item.tenor}</td>

                    <td className="py-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white text-xs"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => handleReject(item.id)}
                          className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    Tidak ada pending approval
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================= */}
      {/* 🔥 HIGH RISK LOAN */}
      {/* ================================================= */}
      <div className="mt-8 bg-white rounded-2xl shadow p-6">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle className="w-5 h-5 text-red-500" />

          <h2 className="font-bold text-lg">High Risk Loan</h2>
        </div>

        <div className="space-y-3">
          {data?.highRiskLoans?.length > 0 ? (
            data.highRiskLoans.map((loan) => (
              <div
                key={loan.id}
                className="flex items-center justify-between border rounded-xl p-4"
              >
                <div>
                  <p className="font-medium">{loan.employee}</p>

                  <p className="text-sm text-gray-500">
                    Jatuh tempo:{" "}
                    {new Date(loan.dueDate).toLocaleDateString("id-ID")}
                  </p>
                </div>

                <div className="text-red-500 font-bold">
                  Rp {safe(loan.remaining).toLocaleString("id-ID")}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400">
              Tidak ada high risk loan
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
