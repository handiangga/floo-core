import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import { TrendingUp, TrendingDown } from "lucide-react";

import dayjs from "dayjs";

export default function CashflowChart({ data = [] }) {
  // =====================================================
  // 🔥 FORMAT
  // =====================================================
  const formatted = data.map((item) => ({
    ...item,

    date: dayjs(item.date).format("DD/MM"),

    masuk: Number(item.masuk || 0),

    keluar: Number(item.keluar || 0),
  }));

  // =====================================================
  // 🔥 TOTAL
  // =====================================================
  const totalMasuk = formatted.reduce((acc, item) => acc + item.masuk, 0);

  const totalKeluar = formatted.reduce((acc, item) => acc + item.keluar, 0);

  // =====================================================
  // 🔥 CUSTOM TOOLTIP
  // =====================================================
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="
            bg-white
            border
            rounded-2xl
            shadow-xl
            p-4
            min-w-[180px]
          "
        >
          <p className="font-semibold mb-3 text-gray-700">{label}</p>

          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-6 text-sm mb-2"
            >
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.name}
              </span>

              <span className="font-bold text-gray-800">
                Rp {Number(entry.value).toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="
        relative
        overflow-hidden
        bg-white
        rounded-3xl
        shadow-sm
        border
        border-gray-100
        p-6
      "
    >
      {/* ================================================= */}
      {/* 🔥 HEADER */}
      {/* ================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">
        {/* LEFT */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Cashflow Analytics
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Monitoring pemasukan & pencairan dana
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex flex-wrap gap-3">
          {/* MASUK */}
          <div
            className="
              flex items-center gap-3
              bg-emerald-50
              border border-emerald-100
              px-4 py-3
              rounded-2xl
            "
          >
            <div className="bg-emerald-100 p-2 rounded-xl">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Total Masuk</p>

              <h3 className="font-bold text-emerald-600">
                Rp {totalMasuk.toLocaleString("id-ID")}
              </h3>
            </div>
          </div>

          {/* KELUAR */}
          <div
            className="
              flex items-center gap-3
              bg-red-50
              border border-red-100
              px-4 py-3
              rounded-2xl
            "
          >
            <div className="bg-red-100 p-2 rounded-xl">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Total Keluar</p>

              <h3 className="font-bold text-red-500">
                Rp {totalKeluar.toLocaleString("id-ID")}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* 🔥 CHART */}
      {/* ================================================= */}
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formatted}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            {/* GRID */}
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />

            {/* DEFINITIONS */}
            <defs>
              {/* GREEN */}
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />

                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>

              {/* RED */}
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />

                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* X */}
            <XAxis
              dataKey="date"
              tick={{
                fontSize: 12,
                fill: "#94a3b8",
              }}
              tickLine={false}
              axisLine={false}
            />

            {/* Y */}
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}jt`;
                }

                if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}rb`;
                }

                return value;
              }}
              tick={{
                fontSize: 12,
                fill: "#94a3b8",
              }}
              tickLine={false}
              axisLine={false}
            />

            {/* TOOLTIP */}
            <Tooltip content={<CustomTooltip />} />

            {/* LEGEND */}
            <Legend />

            {/* 🔴 KELUAR */}
            <Area
              type="monotone"
              dataKey="keluar"
              name="Cash Out"
              stroke="#ef4444"
              fill="url(#expenseGradient)"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
              }}
            />

            {/* 🟢 MASUK */}
            <Area
              type="monotone"
              dataKey="masuk"
              name="Cash In"
              stroke="#22c55e"
              fill="url(#incomeGradient)"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
