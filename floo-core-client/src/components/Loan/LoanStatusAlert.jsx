export default function LoanStatusAlert({ loan }) {
  if (!loan) return null;

  const status = loan.status;

  // =========================
  // STATUS CONFIG
  // =========================
  const statusConfig = {
    pending_manager: {
      bg: "bg-amber-50 border-amber-200 text-amber-700",
      icon: "⏳",
      text: "Pengajuan sedang menunggu approval manager.",
    },

    pending_owner: {
      bg: "bg-orange-50 border-orange-200 text-orange-700",
      icon: "📝",
      text: "Pengajuan sudah disetujui manager dan menunggu approval owner.",
    },

    waiting_signature: {
      bg: "bg-indigo-50 border-indigo-200 text-indigo-700",
      icon: "📄",
      text: "Loan sudah disetujui owner. Silakan download PDF dan upload tanda tangan.",
    },

    signed: {
      bg: "bg-purple-50 border-purple-200 text-purple-700",
      icon: "✍️",
      text: "Dokumen sudah ditandatangani dan siap dicairkan.",
    },

    ongoing: {
      bg: "bg-green-50 border-green-200 text-green-700",
      icon: "💰",
      text: "Dana sudah berhasil dicairkan dan pembayaran sedang berjalan.",
    },

    paid: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
      icon: "✅",
      text: "Loan telah lunas dan seluruh pembayaran telah diselesaikan.",
    },

    overdue: {
      bg: "bg-red-50 border-red-200 text-red-700",
      icon: "⚠️",
      text: "Loan melewati jatuh tempo dan memiliki keterlambatan pembayaran.",
    },

    rejected_manager: {
      bg: "bg-rose-50 border-rose-200 text-rose-700",
      icon: "❌",
      text: loan.reject_reason_manager || "Pengajuan ditolak oleh manager.",
    },

    rejected_owner: {
      bg: "bg-red-50 border-red-200 text-red-700",
      icon: "❌",
      text: loan.reject_reason_owner || "Pengajuan ditolak oleh owner.",
    },
  };

  const current = statusConfig[status];

  if (!current) return null;

  return (
    <div
      className={`
        border
        rounded-2xl
        p-5
        ${current.bg}
      `}
    >
      <div className="flex items-start gap-3">
        {/* ICON */}
        <div className="text-xl">{current.icon}</div>

        {/* CONTENT */}
        <div className="space-y-1">
          <p className="font-semibold">
            {status.replaceAll("_", " ").toUpperCase()}
          </p>

          <p className="text-sm leading-relaxed">{current.text}</p>
        </div>
      </div>
    </div>
  );
}
