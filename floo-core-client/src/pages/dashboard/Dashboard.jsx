import { useEffect, useState } from "react";

import Layout from "../../components/layout/LayoutTest";

import api from "../../api/api";

import {
  Users,
  Wallet,
  TrendingUp,
  Activity as ActivityIcon,
} from "lucide-react";

import FinanceCard from "../../components/ui/FinanceCard";

import StatCard from "../../components/ui/StatCard";

import CashflowChart from "../../components/dashboard/CashflowChart";

import ActivityList from "../../components/dashboard/ActivityList";

import TopOutstanding from "../../components/dashboard/TopOutstanding";

export default function Dashboard() {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================================
  // 🔥 FETCH
  // =========================================================
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      setError("");

      const res = await api.get("/dashboard");

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

  // =========================================================
  // 🔥 HELPER
  // =========================================================
  const s = data?.summary || {};

  const safe = (v) => Number(v) || 0;

  // =========================================================
  // 🔥 KPI ATAS
  // =========================================================
  const financeCards = [
    {
      title: "Total Pegawai",

      value: safe(s.totalEmployees),

      icon: Users,

      color: "from-orange-500 to-orange-600",

      isMoney: false,

      trend: 5,

      subtitle: "Pegawai terdaftar aktif",

      badge: "Employee",
    },

    {
      title: "Total Pinjaman",

      value: safe(s.totalLoan),

      icon: Wallet,

      color: "from-green-500 to-emerald-600",

      trend: 12,

      subtitle: "Total dana dipinjamkan",

      badge: "Growth",
    },

    {
      title: "Sisa Hutang",

      value: safe(s.totalRemaining),

      icon: TrendingUp,

      color: "from-purple-500 to-violet-600",

      trend: 7,

      subtitle: "Outstanding pinjaman aktif",

      badge: "Outstanding",
    },

    {
      title: "Pembayaran",

      value: safe(s.totalPayment),

      icon: ActivityIcon,

      color: "from-blue-500 to-blue-600",

      trend: 10,

      subtitle: "Total pembayaran masuk",

      badge: "Collection",
    },

    {
      title: "Saldo Kas",

      value: safe(s.cashBalance),

      icon: Wallet,

      color:
        safe(s.cashBalance) >= 0
          ? "from-yellow-500 to-amber-600"
          : "from-red-500 to-red-700",

      trend: safe(s.cashBalance) >= 0 ? 15 : -10,

      subtitle:
        safe(s.cashBalance) >= 0
          ? "Cashflow dalam kondisi aman"
          : "Cashflow kritis",

      badge: safe(s.cashBalance) >= 0 ? "Healthy" : "Critical",
    },
  ];

  // =========================================================
  // 🔥 KPI BAWAH
  // =========================================================
  const statCards = [
    {
      title: "Loan Aktif",

      value: safe(s.activeLoans),
    },

    {
      title: "Loan Lunas",

      value: safe(s.paidLoans),
    },

    {
      title: "Collection Rate",

      value: `${safe(s.collectionRate).toFixed(1)}%`,

      highlight: true,
    },

    {
      title: "Cash In",

      value: `Rp ${safe(s.cashIn).toLocaleString("id-ID")}`,
    },

    {
      title: "Cash Out",

      value: `Rp ${safe(s.cashOut).toLocaleString("id-ID")}`,
    },
  ];

  // =========================================================
  // 🔥 LOADING
  // =========================================================
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

  // =========================================================
  // 🔥 ERROR
  // =========================================================
  if (error) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>

          <button
            onClick={fetchDashboard}
            className="
              mt-3
              px-4 py-2
              bg-blue-500
              hover:bg-blue-600
              text-white
              rounded-xl
              transition
            "
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  // =========================================================
  // 🔥 EMPTY
  // =========================================================
  if (!data) {
    return (
      <Layout>
        <div className="py-10 text-center text-gray-500">
          Data tidak ditemukan
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
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Keuangan
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Monitoring pinjaman & cashflow perusahaan
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
      {/* 🔥 KPI ATAS */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {financeCards.map((item, i) => (
          <FinanceCard key={i} {...item} />
        ))}
      </div>

      {/* ================================================= */}
      {/* 🔥 KPI BAWAH */}
      {/* ================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mt-6">
        {statCards.map((item, i) => (
          <StatCard key={i} {...item} />
        ))}
      </div>

      {/* ================================================= */}
      {/* 🔥 CHART + ACTIVITY */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
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
        <TopOutstanding data={data?.topDebtors || []} />
      </div>
    </Layout>
  );
}
