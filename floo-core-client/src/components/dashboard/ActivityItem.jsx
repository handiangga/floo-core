import dayjs from "dayjs";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { formatRupiah } from "../../utils/format";

export default function ActivityItem({ trx }) {
  const isIn = trx.type === "in";

  // 🔥 fallback employee
  const name =
    trx.employee && trx.employee !== "-"
      ? trx.employee
      : trx.source === "loan"
        ? "Pencairan"
        : "Pembayaran";

  // 🔥 ambil inisial
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition p-3 rounded-xl">
      {/* ICON */}
      <div
        className={`p-2 rounded-full ${isIn ? "bg-green-100" : "bg-red-100"}`}
      >
        {isIn ? (
          <ArrowDownCircle className="text-green-600 w-5 h-5" />
        ) : (
          <ArrowUpCircle className="text-red-600 w-5 h-5" />
        )}
      </div>

      {/* AVATAR */}
      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
        {initial}
      </div>

      {/* INFO */}
      <div className="flex-1">
        <p className="font-medium capitalize">{name}</p>
        <p className="text-xs text-gray-400">
          {trx.source === "loan" ? "Pencairan pinjaman" : "Pembayaran pinjaman"}
        </p>
      </div>

      {/* AMOUNT */}
      <div className="text-right">
        <p
          className={
            isIn ? "text-green-500 font-semibold" : "text-red-500 font-semibold"
          }
        >
          {isIn ? "+" : "-"} {formatRupiah(trx.amount)}
        </p>
        <p className="text-xs text-gray-400">
          {dayjs(trx.date).format("DD/MM HH:mm")}
        </p>
      </div>
    </div>
  );
}
