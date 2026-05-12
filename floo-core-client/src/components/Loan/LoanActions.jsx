import Swal from "sweetalert2";

export default function LoanActions({
  loan,
  user,
  actionLoading,

  onApproveManager,
  onRejectManager,

  onApproveOwner,
  onRejectOwner,

  onDownloadPdf,
  onUploadSignature,

  onDisburse,
}) {
  // =====================================
  // CONFIRM HELPER
  // =====================================
  const confirmAction = async (title, text, callback) => {
    const result = await Swal.fire({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, lanjutkan",
      cancelButtonText: "Batal",
      reverseButtons: true,
      confirmButtonColor: "#111827",
      cancelButtonColor: "#d1d5db",
      customClass: {
        popup: "rounded-[32px]",
        confirmButton: "rounded-2xl px-5 py-3",
        cancelButton: "rounded-2xl px-5 py-3",
      },
    });

    if (result.isConfirmed) {
      callback();
    }
  };

  // =====================================
  // BUTTON COMPONENT
  // =====================================
  const ActionButton = ({ onClick, className, children, disabled }) => (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        py-4
        px-5
        rounded-[24px]
        font-semibold
        transition-all
        duration-300
        hover:scale-[1.02]
        shadow-sm
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* =====================================
          MANAGER ACTION
      ===================================== */}
      {loan.status === "pending_manager" && user?.role === "manager" && (
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
          {/* HEADER */}
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-800">
              Approval Manager
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Review pengajuan pinjaman sebelum diteruskan ke owner.
            </p>
          </div>

          {/* ACTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionButton
              disabled={actionLoading}
              onClick={() =>
                confirmAction(
                  "Approve Pengajuan?",
                  "Pengajuan akan diteruskan ke owner.",
                  onApproveManager,
                )
              }
              className="
                bg-gradient-to-r
                from-amber-500
                to-yellow-500
                hover:from-amber-600
                hover:to-yellow-600
                text-white
              "
            >
              ✅ Approve Manager
            </ActionButton>

            <ActionButton
              disabled={actionLoading}
              onClick={() =>
                confirmAction(
                  "Reject Pengajuan?",
                  "Pengajuan akan ditolak.",
                  onRejectManager,
                )
              }
              className="
                bg-gradient-to-r
                from-red-500
                to-rose-500
                hover:from-red-600
                hover:to-rose-600
                text-white
              "
            >
              ❌ Reject
            </ActionButton>
          </div>
        </div>
      )}

      {/* =====================================
          OWNER ACTION
      ===================================== */}
      {loan.status === "pending_owner" && user?.role === "owner" && (
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
          {/* HEADER */}
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-800">Approval Owner</h3>

            <p className="text-sm text-gray-500 mt-1">
              Final approval sebelum dokumen perjanjian dibuat.
            </p>
          </div>

          {/* ACTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionButton
              disabled={actionLoading}
              onClick={() =>
                confirmAction(
                  "Approve Loan?",
                  "Loan akan disetujui dan lanjut ke proses tanda tangan.",
                  onApproveOwner,
                )
              }
              className="
                bg-gradient-to-r
                from-orange-500
                to-amber-500
                hover:from-orange-600
                hover:to-amber-600
                text-white
              "
            >
              📝 Approve Owner
            </ActionButton>

            <ActionButton
              disabled={actionLoading}
              onClick={() =>
                confirmAction(
                  "Reject Loan?",
                  "Pengajuan akan ditolak.",
                  onRejectOwner,
                )
              }
              className="
                bg-gradient-to-r
                from-red-500
                to-rose-500
                hover:from-red-600
                hover:to-rose-600
                text-white
              "
            >
              ❌ Reject
            </ActionButton>
          </div>
        </div>
      )}

      {/* =====================================
          PDF + SIGNATURE
      ===================================== */}
      {loan.status === "waiting_signature" && (
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
          {/* HEADER */}
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-800">
              Dokumen Perjanjian
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Download PDF perjanjian dan upload tanda tangan karyawan.
            </p>
          </div>

          {/* ACTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionButton
              onClick={onDownloadPdf}
              className="
                bg-gradient-to-r
                from-blue-600
                to-indigo-600
                hover:from-blue-700
                hover:to-indigo-700
                text-white
              "
            >
              📄 Download PDF
            </ActionButton>

            <ActionButton
              onClick={onUploadSignature}
              className="
                bg-gradient-to-r
                from-violet-600
                to-fuchsia-600
                hover:from-violet-700
                hover:to-fuchsia-700
                text-white
              "
            >
              ✍️ Upload TTD
            </ActionButton>
          </div>
        </div>
      )}

      {/* =====================================
          DISBURSE
      ===================================== */}
      {loan.status === "signed" && (
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
          {/* HEADER */}
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-800">Pencairan Dana</h3>

            <p className="text-sm text-gray-500 mt-1">
              Dana pinjaman siap dicairkan ke karyawan.
            </p>
          </div>

          {/* BUTTON */}
          <ActionButton
            disabled={actionLoading}
            onClick={() =>
              confirmAction(
                "Cairkan Dana?",
                "Dana akan dicairkan dan status loan berubah menjadi ongoing.",
                onDisburse,
              )
            }
            className="
              w-full
              bg-gradient-to-r
              from-green-600
              to-emerald-600
              hover:from-green-700
              hover:to-emerald-700
              text-white
            "
          >
            💰 Cairkan Dana
          </ActionButton>
        </div>
      )}

      {/* =====================================
          DISBURSED
      ===================================== */}
      {loan.status === "disbursed" && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-[32px] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
              💰
            </div>

            <div>
              <h3 className="font-bold text-green-700 text-lg">
                Dana Sudah Dicairkan
              </h3>

              <p className="text-sm text-green-600 mt-1">
                Loan sudah berhasil dicairkan ke karyawan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          REJECTED
      ===================================== */}
      {(loan.status === "rejected_manager" ||
        loan.status === "rejected_owner") && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-[32px] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-2xl">
              ❌
            </div>

            <div>
              <h3 className="font-bold text-red-700 text-lg">
                Pengajuan Ditolak
              </h3>

              <p className="text-sm text-red-600 mt-1">
                Loan tidak dapat dilanjutkan karena pengajuan ditolak.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
