import { useEffect, useMemo, useState } from "react";

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
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

import FinanceCard from "../../components/ui/FinanceCard";

import CashflowChart from "../../components/dashboard/CashflowChart";

import { useNavigate } from "react-router-dom";

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

      color: "from-red-400 to-red-500",
    },

    {
      title: "Disbursed",

      value: safe(s.totalDisbursed),

      icon: Landmark,

      color: "from-blue-400 to-blue-500",
    },

    {
      title: "Pending Final",

      value: safe(s.pendingFinalApproval),

      icon: CheckCircle2,

      color: "from-yellow-400 to-yellow-500",

      isMoney: false,
    },

    {
      title: "Bad Loans",

      value: safe(s.badLoans),

      icon: AlertTriangle,

      color: "from-orange-400 to-orange-500",

      isMoney: false,
    },

    {
      title: "Cash Balance",

      value: safe(s.cashBalance),

      icon: TrendingUp,

      color:
        safe(s.cashBalance) >= 0
          ? "from-green-400 to-green-500"
          : "from-red-400 to-red-500",
    },
  ];

  // =====================================================
  // 🔥 ACTIVITIES
  // =====================================================
  const activities = useMemo(() => {
    return (
      data?.activities?.map((item) => {
        const isIn = item.type === "in";

        return {
          ...item,

          icon: isIn ? (
            <ArrowDownCircle className="w-5 h-5 text-green-500" />
          ) : (
            <ArrowUpCircle className="w-5 h-5 text-red-500" />
          ),

          color: isIn ? "text-green-500" : "text-red-500",

          sign: isIn ? "+" : "-",
        };
      }) || []
    );
  }, [data]);

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
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>

          <p className="text-sm text-gray-500">Executive finance analytics</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {financeCards.map((item, i) => (
          <FinanceCard key={i} {...item} />
        ))}
      </div>

      {/* ================================================= */}
      {/* 🔥 FINAL APPROVAL */}
      {/* ================================================= */}
      <div className="mt-8 bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-lg">Final Approval Queue</h2>

            <p className="text-sm text-gray-500">
              Pengajuan menunggu approval owner
            </p>
          </div>

          <div className="text-sm text-gray-400">
            {data?.finalApprovals?.length} pengajuan
          </div>
        </div>

        <div className="overflow-auto max-h-[420px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b">
                <th className="text-left py-3">Nama</th>

                <th className="text-left py-3">Nominal</th>

                <th className="text-left py-3">Tenor</th>

                <th className="text-left py-3">Remaining</th>

                <th className="text-right py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {data?.finalApprovals?.length > 0 ? (
                data.finalApprovals.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-4 font-medium">{item.employee}</td>

                    <td className="py-4">
                      Rp {safe(item.amount).toLocaleString("id-ID")}
                    </td>

                    <td className="py-4">{item.tenor}</td>

                    <td className="py-4 text-red-500 font-medium">
                      Rp {safe(item.remaining).toLocaleString("id-ID")}
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        {/* DETAIL */}
                        <button
                          onClick={() => navigate(`/loans/${item.id}`)}
                          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Detail
                        </button>

                        {/* APPROVE */}
                        <button
                          onClick={() => handleApproveOwner(item.id)}
                          className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white text-xs"
                        >
                          Approve
                        </button>

                        {/* REJECT */}
                        <button
                          onClick={() => handleRejectOwner(item.id)}
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
      {/* 🔥 CASHFLOW + ACTIVITY */}
      {/* ================================================= */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* CHART */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow p-6">
          <div className="mb-5">
            <h2 className="font-bold text-lg">Cashflow Analytics</h2>

            <p className="text-sm text-gray-500">
              Monitoring cash in & cash out
            </p>
          </div>

          <CashflowChart data={data?.cashflow || []} />
        </div>

        {/* ACTIVITY */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="mb-5">
            <h2 className="font-bold text-lg">Aktivitas</h2>

            <p className="text-sm text-gray-500">Aktivitas cashflow terbaru</p>
          </div>

          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border rounded-xl p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {item.icon}
                    </div>

                    <div>
                      <p className="font-medium">{item.employee}</p>

                      <p className="text-sm text-gray-500 capitalize">
                        {item.source}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold ${item.color}`}>
                      {item.sign} Rp {safe(item.amount).toLocaleString("id-ID")}
                    </div>

                    <div className="text-xs text-gray-400">
                      {new Date(item.date).toLocaleDateString("id-ID")}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400">Tidak ada aktivitas</div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* 🔥 TOP OUTSTANDING */}
      {/* ================================================= */}
      <div className="mt-8 bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-lg">Top Outstanding</h2>

            <p className="text-sm text-gray-500">
              Outstanding pinjaman terbesar
            </p>
          </div>

          <div className="text-sm text-gray-400">
            {data?.topOutstanding?.length} orang
          </div>
        </div>

        <div className="space-y-3">
          {data?.topOutstanding?.length > 0 ? (
            data.topOutstanding.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border rounded-xl p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                      ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                            ? "bg-gray-200 text-gray-700"
                            : index === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-500"
                      }
                    `}
                  >
                    #{index + 1}
                  </div>

                  <div>
                    <p className="font-medium">{item.employee}</p>

                    <p className="text-sm text-gray-500">Outstanding loan</p>
                  </div>
                </div>

                <div className="font-bold text-red-500">
                  Rp {safe(item.total).toLocaleString("id-ID")}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400">
              Tidak ada outstanding loan
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
