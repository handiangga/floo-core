import { useEffect, useState } from "react";

import Layout from "../../components/layout/LayoutTest";

import api from "../../api/api";

import Swal from "sweetalert2";

import {
  Wallet,
  Landmark,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Eye,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import FinanceCard from "../../components/ui/FinanceCard";

import CashflowChart from "../../components/dashboard/CashflowChart";

import RiskAlerts from "../../components/dashboard/RiskAlerts";

import ActivityList from "../../components/dashboard/ActivityList";

import TopOutstanding from "../../components/dashboard/TopOutstanding";

export default function OwnerDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // 🔥 FETCH
  // =====================================================
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      setError("");

      const res = await api.get("/dashboard/owner");

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
  // 🔥 APPROVE OWNER
  // =====================================================
  const handleApproveOwner = async (id) => {
    try {
      const confirm = await Swal.fire({
        title: "Approve final pinjaman?",
        text: "Pengajuan akan diteruskan ke proses tanda tangan",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Approve",
        confirmButtonColor: "#22c55e",
      });

      if (!confirm.isConfirmed) return;

      await api.post(`/loans/${id}/approve-owner`);

      Swal.fire(
        "Berhasil",
        "Pengajuan diteruskan ke tahap tanda tangan",
        "success",
      );

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
  // 🔥 REJECT OWNER
  // =====================================================
  const handleRejectOwner = async (id) => {
    try {
      const { value: reason } = await Swal.fire({
        title: "Reject pinjaman",

        input: "textarea",

        inputLabel: "Alasan reject owner",

        inputPlaceholder: "Masukkan alasan reject...",

        inputAttributes: {
          "aria-label": "Alasan reject",
        },

        showCancelButton: true,

        confirmButtonText: "Reject",

        confirmButtonColor: "#ef4444",
      });

      if (!reason) return;

      await api.post(`/loans/${id}/reject-owner`, {
        reason,
      });

      Swal.fire("Berhasil", "Pengajuan ditolak owner", "success");

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
  // 🔥 KPI
  // =====================================================
  const financeCards = [
    {
      title: "Outstanding",

      value: safe(s.totalOutstanding),

      icon: Wallet,

      color: "from-red-500 to-red-600",

      trend: 12,

      subtitle: "Outstanding loan aktif",

      badge: "Monthly Growth",
    },

    {
      title: "Disbursed",

      value: safe(s.totalDisbursed),

      icon: Landmark,

      color: "from-blue-500 to-blue-600",

      trend: 8,

      subtitle: "Total dana dicairkan",

      badge: "Stable",
    },

    {
      title: "Pending Final",

      value: safe(s.pendingFinalApproval),

      icon: CheckCircle2,

      color: "from-yellow-500 to-yellow-600",

      isMoney: false,

      trend: -2,

      subtitle: "Menunggu approval owner",

      badge: "Need Review",
    },

    {
      title: "Bad Loans",

      value: safe(s.badLoans),

      icon: AlertTriangle,

      color: "from-orange-500 to-orange-600",

      isMoney: false,

      trend: 4,

      subtitle: "Pinjaman overdue",

      badge: "Risk",
    },

    {
      title: "Cash Balance",

      value: safe(s.cashBalance),

      icon: TrendingUp,

      color:
        safe(s.cashBalance) >= 0
          ? "from-green-500 to-emerald-600"
          : "from-red-500 to-red-700",

      trend: safe(s.cashBalance) >= 0 ? 15 : -10,

      subtitle:
        safe(s.cashBalance) >= 0
          ? "Cashflow dalam kondisi aman"
          : "Cashflow kritis",

      badge: safe(s.cashBalance) >= 0 ? "Healthy" : "Critical",
    },
  ];

  // =====================================================
  // 🔥 LOADING
  // =====================================================
  if (loading) {
    return (
      <Layout>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-3xl bg-gray-200 animate-pulse"
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
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>

          <p className="text-sm text-gray-500 mt-1">
            Executive financial monitoring platform
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="
            px-5 py-2.5
            rounded-xl
            bg-gray-900
            hover:bg-black
            text-white
            text-sm
            font-medium
            transition
          "
        >
          Refresh Dashboard
        </button>
      </div>

      {/* ================================================= */}
      {/* 🔥 KPI */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {financeCards.map((item, i) => (
          <FinanceCard key={i} {...item} />
        ))}
      </div>

      {/* ================================================= */}
      {/* 🔥 RISK ALERTS */}
      {/* ================================================= */}
      <RiskAlerts alerts={data?.riskAlerts || []} />

      {/* ================================================= */}
      {/* 🔥 FINAL APPROVAL */}
      {/* ================================================= */}
      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-xl text-gray-900">
              Final Approval Queue
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Pengajuan menunggu approval owner
            </p>
          </div>

          <div className="text-sm text-gray-400">
            {data?.finalApprovals?.length || 0} pengajuan
          </div>
        </div>

        <div className="overflow-auto max-h-[420px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 font-semibold text-gray-600">
                  Nama
                </th>

                <th className="text-left py-4 font-semibold text-gray-600">
                  Nominal
                </th>

                <th className="text-left py-4 font-semibold text-gray-600">
                  Tenor
                </th>

                <th className="text-left py-4 font-semibold text-gray-600">
                  Remaining
                </th>

                <th className="text-right py-4 font-semibold text-gray-600">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {data?.finalApprovals?.length > 0 ? (
                data.finalApprovals.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-5 font-medium text-gray-800">
                      {item.employee}
                    </td>

                    <td className="py-5 font-semibold text-gray-800">
                      Rp {safe(item.amount).toLocaleString("id-ID")}
                    </td>

                    <td className="py-5 text-gray-600">{item.tenor} Bulan</td>

                    <td className="py-5 text-red-500 font-bold">
                      Rp {safe(item.remaining).toLocaleString("id-ID")}
                    </td>

                    <td className="py-5">
                      <div className="flex justify-end gap-2">
                        {/* DETAIL */}
                        <button
                          onClick={() => navigate(`/loans/${item.id}`)}
                          className="
                            px-3 py-2
                            rounded-xl
                            bg-gray-100
                            hover:bg-gray-200
                            text-gray-700
                            text-xs
                            font-medium
                            flex items-center gap-1
                            transition
                          "
                        >
                          <Eye className="w-3 h-3" />
                          Detail
                        </button>

                        {/* APPROVE */}
                        <button
                          onClick={() => handleApproveOwner(item.id)}
                          className="
                            px-3 py-2
                            rounded-xl
                            bg-green-500
                            hover:bg-green-600
                            text-white
                            text-xs
                            font-medium
                            transition
                          "
                        >
                          Approve
                        </button>

                        {/* REJECT */}
                        <button
                          onClick={() => handleRejectOwner(item.id)}
                          className="
                            px-3 py-2
                            rounded-xl
                            bg-red-500
                            hover:bg-red-600
                            text-white
                            text-xs
                            font-medium
                            transition
                          "
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Tidak ada pending approval
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================= */}
      {/* 🔥 CASHFLOW + ACTIVITY */}
      {/* ================================================= */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* CHART */}
        <div className="xl:col-span-2">
          <CashflowChart data={data?.cashflow || []} />
        </div>

        {/* ACTIVITY */}
        <ActivityList data={data?.activities || []} />
      </div>

      {/* ================================================= */}
      {/* 🔥 TOP OUTSTANDING */}
      {/* ================================================= */}
      <div className="mt-8">
        <TopOutstanding data={data?.topOutstanding || []} />
      </div>
    </Layout>
  );
}
