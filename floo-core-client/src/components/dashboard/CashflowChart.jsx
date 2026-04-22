import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import dayjs from "dayjs";

export default function CashflowChart({ data = [] }) {
  const formatted = data.map((item) => ({
    ...item,
    date: dayjs(item.date).format("DD/MM"),
  }));

  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="font-semibold mb-4">Cashflow</h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <Tooltip />

          {/* 🔴 keluar */}
          <Line
            type="monotone"
            dataKey="keluar"
            stroke="#ef4444"
            strokeWidth={3}
          />

          {/* 🟢 masuk */}
          <Line
            type="monotone"
            dataKey="masuk"
            stroke="#22c55e"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
