import { formatRupiah } from "../../utils/format";

export default function LoanInfoCard({ loan }) {
  const progress =
    loan.total_amount > 0
      ? (
          ((loan.total_amount - loan.remaining_amount) / loan.total_amount) *
          100
        ).toFixed(0)
      : 0;

  // =========================
  // STATUS LABEL
  // =========================
  const statusMap = {
    pending_manager: {
      label: "Menunggu Manager",
      color: "bg-yellow-100 text-yellow-700",
    },

    pending_owner: {
      label: "Menunggu Owner",
      color: "bg-orange-100 text-orange-700",
    },

    approved_owner: {
      label: "Disetujui Owner",
      color: "bg-blue-100 text-blue-700",
    },

    signed: {
      label: "Sudah TTD",
      color: "bg-purple-100 text-purple-700",
    },

    disbursed: {
      label: "Dana Cair",
      color: "bg-green-100 text-green-700",
    },

    rejected_manager: {
      label: "Ditolak Manager",
      color: "bg-red-100 text-red-700",
    },

    rejected_owner: {
      label: "Ditolak Owner",
      color: "bg-red-100 text-red-700",
    },
  };

  const status = statusMap[loan.status] || {
    label: loan.status,
    color: "bg-gray-100 text-gray-700",
  };

  // =========================
  // PROGRESS COLOR
  // =========================
  const progressColor =
    loan.status === "disbursed"
      ? "bg-green-500"
      : loan.status.includes("reject")
        ? "bg-red-500"
        : "bg-blue-500";

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 space-y-6">
      {/* =========================
          TOP STATS
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Total Pinjaman" value={loan.total_amount} />

        <Stat label="Sisa Tagihan" value={loan.remaining_amount} red />

        <Stat label="Cicilan" value={loan.installment} />
      </div>

      {/* =========================
          INFO
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
        {/* DISBURSED */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-gray-400 text-xs mb-1">Tanggal Cair</p>

          <p className="font-medium text-gray-700">
            {loan.disbursed_at
              ? new Date(loan.disbursed_at).toLocaleDateString("id-ID")
              : "-"}
          </p>
        </div>

        {/* DUE DATE */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-gray-400 text-xs mb-1">Jatuh Tempo</p>

          <p className="font-medium text-gray-700">
            {loan.due_date
              ? new Date(loan.due_date).toLocaleDateString("id-ID")
              : "-"}
          </p>
        </div>

        {/* STATUS */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-gray-400 text-xs mb-2">Status</p>

          <div
            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}
          >
            {status.label}
          </div>
        </div>
      </div>

      {/* =========================
          REJECT REASON
      ========================= */}
      {(loan.status === "rejected_manager" ||
        loan.status === "rejected_owner") &&
        loan.reject_reason && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-700 font-semibold mb-1">Alasan Penolakan</p>

            <p className="text-sm text-red-600 leading-relaxed">
              {loan.reject_reason}
            </p>
          </div>
        )}

      {/* =========================
          PROGRESS
      ========================= */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Progress Pembayaran</span>

          <span>{progress}%</span>
        </div>

        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
          <div
            className={`${progressColor} h-3 rounded-full transition-all duration-500`}
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// =========================
// STAT
// =========================
function Stat({ label, value, red }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>

      <p
        className={`text-2xl font-bold ${
          red ? "text-red-500" : "text-gray-800"
        }`}
      >
        {formatRupiah(value)}
      </p>
    </div>
  );
}
