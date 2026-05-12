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
      label: "Pending Manager",
      className: "bg-amber-100 text-amber-700 border border-amber-200",
    },

    pending_owner: {
      label: "Pending Owner",
      className: "bg-orange-100 text-orange-700 border border-orange-200",
    },

    waiting_signature: {
      label: "Menunggu TTD",
      className: "bg-violet-100 text-violet-700 border border-violet-200",
    },

    signed: {
      label: "Sudah TTD",
      className: "bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200",
    },

    ongoing: {
      label: "Aktif",
      className: "bg-blue-100 text-blue-700 border border-blue-200",
    },

    paid: {
      label: "Lunas",
      className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    },

    overdue: {
      label: "Terlambat",
      className: "bg-red-100 text-red-700 border border-red-200",
    },

    rejected_manager: {
      label: "Ditolak Manager",
      className: "bg-rose-100 text-rose-700 border border-rose-200",
    },

    rejected_owner: {
      label: "Ditolak Owner",
      className: "bg-red-100 text-red-700 border border-red-200",
    },
  };

  const currentStatus = statusMap[loan?.status] || {
    label: loan?.status,
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  };

  // =========================
  // REJECT REASON
  // =========================
  const rejectReason = loan.reject_reason_manager || loan.reject_reason_owner;

  // =========================
  // PROGRESS COLOR
  // =========================
  const progressColor =
    loan.status === "paid"
      ? "bg-emerald-500"
      : loan.status.includes("reject")
        ? "bg-red-500"
        : progress > 0
          ? "bg-blue-500"
          : "bg-gray-300";

  return (
    <div className="bg-white p-7 rounded-[32px] shadow-lg border border-gray-100 space-y-7">
      {/* =========================
          TOP STATS
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Stat label="Total Pinjaman" value={loan.total_amount} />

        <Stat
          label="Sisa Tagihan"
          value={loan.remaining_amount}
          red={loan.remaining_amount > 0}
          green={loan.remaining_amount === 0}
        />

        <Stat label="Cicilan" value={loan.installment} />
      </div>

      {/* =========================
          INFO
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
        {/* TANGGAL CAIR */}
        <InfoCard
          label="Tanggal Cair"
          value={
            loan.disbursed_at
              ? new Date(loan.disbursed_at).toLocaleDateString("id-ID")
              : "-"
          }
        />

        {/* JATUH TEMPO */}
        <InfoCard
          label="Jatuh Tempo"
          value={
            loan.due_date
              ? new Date(loan.due_date).toLocaleDateString("id-ID")
              : "-"
          }
        />

        {/* STATUS */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-5 border border-gray-100">
          <p className="text-gray-400 text-xs mb-3 uppercase tracking-wide">
            Status
          </p>

          <span
            className={`
              inline-flex
              items-center
              px-4
              py-2
              rounded-2xl
              text-xs
              font-semibold
              shadow-sm
              ${currentStatus.className}
            `}
          >
            {currentStatus.label}
          </span>
        </div>
      </div>

      {/* =========================
          REJECT REASON
      ========================= */}
      {(loan.status === "rejected_manager" ||
        loan.status === "rejected_owner") &&
        rejectReason && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />

              <p className="text-red-700 font-semibold">Alasan Penolakan</p>
            </div>

            <p className="text-sm text-red-600 leading-relaxed">
              {rejectReason}
            </p>
          </div>
        )}

      {/* =========================
          PROGRESS
      ========================= */}
      <div>
        <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
          <span className="font-medium">Progress Pembayaran</span>

          <span className="font-semibold">{progress}%</span>
        </div>

        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
          <div
            className={`
              ${progressColor}
              h-3
              rounded-full
              transition-all
              duration-700
            `}
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {/* PAID LABEL */}
        {loan.status === "paid" && (
          <div className="mt-3 flex justify-end">
            <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded-full font-semibold">
              🎉 Loan Lunas
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================
// INFO CARD
// =========================
function InfoCard({ label, value }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-5 border border-gray-100">
      <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">
        {label}
      </p>

      <p className="font-semibold text-gray-700 text-base">{value}</p>
    </div>
  );
}

// =========================
// STAT
// =========================
function Stat({ label, value, red, green }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
        {label}
      </p>

      <p
        className={`text-4xl font-black tracking-tight ${
          red ? "text-red-500" : green ? "text-emerald-500" : "text-gray-800"
        }`}
      >
        {formatRupiah(value)}
      </p>
    </div>
  );
}
