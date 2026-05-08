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
  // =========================
  // CONFIRM HELPER
  // =========================
  const confirmAction = async (title, callback) => {
    const result = await Swal.fire({
      title,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      callback();
    }
  };

  return (
    <div className="space-y-3 mt-4">
      {/* =========================
          MANAGER
      ========================= */}
      {loan.status === "pending_manager" && user?.role === "manager" && (
        <div className="flex gap-3">
          <button
            disabled={actionLoading}
            onClick={() =>
              confirmAction("Approve pengajuan ini?", onApproveManager)
            }
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 transition text-white py-3 rounded-2xl font-medium"
          >
            Approve Manager
          </button>

          <button
            disabled={actionLoading}
            onClick={() =>
              confirmAction("Reject pengajuan ini?", onRejectManager)
            }
            className="flex-1 bg-red-500 hover:bg-red-600 transition text-white py-3 rounded-2xl font-medium"
          >
            Reject
          </button>
        </div>
      )}

      {/* =========================
          OWNER
      ========================= */}
      {loan.status === "pending_owner" && user?.role === "owner" && (
        <div className="flex gap-3">
          <button
            disabled={actionLoading}
            onClick={() => confirmAction("Approve owner?", onApproveOwner)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 transition text-white py-3 rounded-2xl font-medium"
          >
            Approve Owner
          </button>

          <button
            disabled={actionLoading}
            onClick={() =>
              confirmAction("Reject pengajuan ini?", onRejectOwner)
            }
            className="flex-1 bg-red-500 hover:bg-red-600 transition text-white py-3 rounded-2xl font-medium"
          >
            Reject
          </button>
        </div>
      )}

      {/* =========================
          PDF + SIGNATURE
      ========================= */}
      {loan.status === "waiting_signature" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={onDownloadPdf}
            className="bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-2xl font-medium"
          >
            Download PDF
          </button>

          <button
            onClick={onUploadSignature}
            className="bg-purple-600 hover:bg-purple-700 transition text-white py-3 rounded-2xl font-medium"
          >
            Upload TTD
          </button>
        </div>
      )}

      {/* =========================
          DISBURSE
      ========================= */}
      {loan.status === "signed" && (
        <button
          disabled={actionLoading}
          onClick={() => confirmAction("Cairkan dana sekarang?", onDisburse)}
          className="w-full bg-green-600 hover:bg-green-700 transition text-white py-3 rounded-2xl font-medium"
        >
          Cairkan Dana
        </button>
      )}

      {/* =========================
          DONE
      ========================= */}
      {loan.status === "disbursed" && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-5 rounded-2xl text-center font-semibold">
          💰 Dana Sudah Dicairkan
        </div>
      )}

      {/* =========================
          REJECTED
      ========================= */}
      {(loan.status === "rejected_manager" ||
        loan.status === "rejected_owner") && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl text-center font-semibold">
          ❌ Pengajuan Ditolak
        </div>
      )}
    </div>
  );
}
