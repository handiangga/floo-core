import { useEffect, useState, useMemo } from "react";
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

// 🔥 PASTIKAN PAKAI YANG INI (BUKAN DI UI)
import ActivityItem from "../../components/dashboard/ActivityItem";
import CashflowChart from "../../components/dashboard/CashflowChart";
import TopDebtor from "../../components/dashboard/TopDebtor";

import dayjs from "dayjs";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const s = data?.summary || {};
  const safe = (v) => Number(v) || 0;

  // 🔥 ACTIVITY FIX TOTAL
  const activities = useMemo(() => {
    if (!data?.activities) return [];

    return data.activities.map((item) => ({
      id: item.id,
      type: item.type === "in" ? "in" : "out",
      amount: Number(item.amount) || 0,
      source: item.source || "payment",
      employee: item.employee || "-",
      date: item.date,
    }));
  }, [data]);

  // 🔥 KPI ATAS
  const financeCards = [
    {
      title: "Total Pegawai",
      value: safe(s.totalEmployees),
      icon: Users,
      color: "from-orange-400 to-orange-500",
      isMoney: false,
    },
    {
      title: "Total Pinjaman",
      value: safe(s.totalLoan),
      icon: Wallet,
      color: "from-green-400 to-green-500",
    },
    {
      title: "Sisa Hutang",
      value: safe(s.totalRemaining),
      icon: TrendingUp,
      color: "from-purple-400 to-purple-500",
    },
    {
      title: "Pembayaran",
      value: safe(s.totalPayment),
      icon: ActivityIcon,
      color: "from-blue-400 to-blue-500",
    },
    {
      title: "Saldo Kas",
      value: safe(s.cashBalance),
      icon: Wallet,
      color:
        s.cashBalance >= 0
          ? "from-yellow-400 to-yellow-500"
          : "from-red-400 to-red-500",
    },
  ];

  // 🔥 KPI BAWAH
  const statCards = [
    { title: "Loan Aktif", value: safe(s.activeLoans) },
    { title: "Loan Lunas", value: safe(s.paidLoans) },
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

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </Layout>
    );
  }

  if (!data) return <Layout>Error load data</Layout>;

  return (
    <Layout>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard Keuangan</h1>
        <p className="text-gray-500 text-sm">Monitoring pinjaman & cashflow</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {financeCards.map((item, i) => (
          <FinanceCard key={i} {...item} />
        ))}
      </div>

      {/* KPI BAWAH */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mt-6">
        {statCards.map((item, i) => (
          <StatCard key={i} {...item} />
        ))}
      </div>

      {/* CHART + ACTIVITY */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <div className="xl:col-span-2">
          <CashflowChart data={data.cashflow} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Aktivitas</h2>

          <div className="space-y-3 max-h-[260px] overflow-auto">
            {activities.length > 0 ? (
              activities.map((trx) => <ActivityItem key={trx.id} trx={trx} />)
            ) : (
              <p className="text-sm text-gray-400">Belum ada aktivitas</p>
            )}
          </div>
        </div>
      </div>

      {/* 🔥 TOP DEBTOR */}
      <div className="mt-6">
        <TopDebtor data={data.topDebtors} />
      </div>
    </Layout>
  );
}
