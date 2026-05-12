export default function LoanStatusAlert({ loan }) {
  if (!loan) return null;

  const status = loan.status;

  // =====================================
  // STATUS CONFIG
  // =====================================
  const statusConfig = {
    pending_manager: {
      bg: "from-amber-50 to-yellow-50 border-amber-200 text-amber-700",
      icon: "⏳",
      title: "Menunggu Approval Manager",
      text: "Pengajuan pinjaman sedang menunggu persetujuan dari manager.",
      glow: "bg-amber-300",
    },

    pending_owner: {
      bg: "from-orange-50 to-amber-50 border-orange-200 text-orange-700",
      icon: "📝",
      title: "Menunggu Approval Owner",
      text: "Pengajuan sudah disetujui manager dan menunggu approval owner.",
      glow: "bg-orange-300",
    },

    waiting_signature: {
      bg: "from-indigo-50 to-violet-50 border-indigo-200 text-indigo-700",
      icon: "📄",
      title: "Menunggu Tanda Tangan",
      text: "Loan telah disetujui owner. Silakan download dokumen dan upload tanda tangan.",
      glow: "bg-indigo-300",
    },

    signed: {
      bg: "from-purple-50 to-fuchsia-50 border-purple-200 text-purple-700",
      icon: "✍️",
      title: "Dokumen Sudah Ditandatangani",
      text: "Dokumen perjanjian telah ditandatangani dan dana siap dicairkan.",
      glow: "bg-purple-300",
    },

    ongoing: {
      bg: "from-green-50 to-emerald-50 border-green-200 text-green-700",
      icon: "💰",
      title: "Pembayaran Sedang Berjalan",
      text: "Dana telah berhasil dicairkan dan cicilan pembayaran sedang berlangsung.",
      glow: "bg-green-300",
    },

    paid: {
      bg: "from-emerald-50 to-green-50 border-emerald-200 text-emerald-700",
      icon: "🏆",
      title: "Loan Telah Lunas",
      text: "Seluruh pembayaran pinjaman telah diselesaikan dan surat pelunasan tersedia.",
      glow: "bg-emerald-300",
    },

    overdue: {
      bg: "from-red-50 to-rose-50 border-red-200 text-red-700",
      icon: "⚠️",
      title: "Pembayaran Terlambat",
      text: "Loan melewati jatuh tempo dan memiliki keterlambatan pembayaran.",
      glow: "bg-red-300",
    },

    rejected_manager: {
      bg: "from-rose-50 to-red-50 border-rose-200 text-rose-700",
      icon: "❌",
      title: "Ditolak Manager",
      text: loan.reject_reason_manager || "Pengajuan ditolak oleh manager.",
      glow: "bg-rose-300",
    },

    rejected_owner: {
      bg: "from-red-50 to-rose-50 border-red-200 text-red-700",
      icon: "❌",
      title: "Ditolak Owner",
      text: loan.reject_reason_owner || "Pengajuan ditolak oleh owner.",
      glow: "bg-red-300",
    },
  };

  const current = statusConfig[status];

  if (!current) return null;

  return (
    <div
      className={`
        relative
        overflow-hidden
        border
        rounded-[30px]
        p-6
        shadow-sm
        bg-gradient-to-r
        ${current.bg}
      `}
    >
      {/* =====================================
          GLOW EFFECT
      ===================================== */}
      <div
        className={`
          absolute
          top-0
          right-0
          w-40
          h-40
          rounded-full
          blur-3xl
          opacity-20
          ${current.glow}
        `}
      />

      {/* =====================================
          CONTENT
      ===================================== */}
      <div className="relative flex items-start gap-5">
        {/* ICON */}
        <div
          className="
            w-14
            h-14
            rounded-2xl
            bg-white/60
            backdrop-blur-sm
            flex
            items-center
            justify-center
            text-2xl
            shadow-sm
            shrink-0
          "
        >
          {current.icon}
        </div>

        {/* TEXT */}
        <div className="flex-1">
          <h3 className="text-lg font-bold">{current.title}</h3>

          <p className="text-sm leading-relaxed mt-1 opacity-90">
            {current.text}
          </p>

          {/* STATUS BADGE */}
          <div className="mt-4">
            <span
              className="
                inline-flex
                items-center
                px-4
                py-2
                rounded-2xl
                bg-white/70
                backdrop-blur-sm
                text-xs
                font-semibold
                uppercase
                tracking-wide
                shadow-sm
              "
            >
              {status.replaceAll("_", " ")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
