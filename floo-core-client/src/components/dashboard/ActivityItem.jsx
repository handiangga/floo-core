import dayjs from "dayjs";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { formatRupiah } from "../../utils/format";

export default function ActivityItem({ trx }) {
  const isIn = trx.type === "in";

  return (
    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
      <div
        className={`p-2 rounded-full ${isIn ? "bg-green-100" : "bg-red-100"}`}
      >
        {isIn ? (
          <ArrowDownCircle className="text-green-600 w-5 h-5" />
        ) : (
          <ArrowUpCircle className="text-red-600 w-5 h-5" />
        )}
      </div>

      <div className="flex-1">
        <p className="font-medium">{trx.employee || "-"}</p>
        <p className="text-xs text-gray-400">
          {isIn ? "Pembayaran" : "Pencairan"}
        </p>
      </div>

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
