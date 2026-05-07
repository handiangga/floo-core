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
            className="flex-1 bg-yellow-500 text-white py-3 rounded-xl"
          >
            Approve Manager
          </button>

          <button
            disabled={actionLoading}
            onClick={() =>
              confirmAction("Reject pengajuan ini?", onRejectManager)
            }
            className="flex-1 bg-red-500 text-white py-3 rounded-xl"
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
            className="flex-1 bg-orange-500 text-white py-3 rounded-xl"
          >
            Approve Owner
          </button>

          <button
            disabled={actionLoading}
            onClick={() =>
              confirmAction("Reject pengajuan ini?", onRejectOwner)
            }
            className="flex-1 bg-red-500 text-white py-3 rounded-xl"
          >
            Reject
          </button>
        </div>
      )}

      {/* =========================
          PDF + SIGNATURE
      ========================= */}
      {loan.status === "approved_owner" && (
        <div className="flex gap-3">
          <button
            onClick={onDownloadPdf}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl"
          >
            Download PDF
          </button>

          <button
            onClick={onUploadSignature}
            className="flex-1 bg-purple-600 text-white py-3 rounded-xl"
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
          className="w-full bg-green-600 text-white py-3 rounded-xl"
        >
          Cairkan Dana
        </button>
      )}

      {/* =========================
          DONE
      ========================= */}
      {loan.status === "disbursed" && (
        <div className="bg-green-100 text-green-700 p-4 rounded-xl text-center font-semibold">
          Dana Sudah Dicairkan
        </div>
      )}

      {/* =========================
          REJECTED
      ========================= */}
      {loan.status === "rejected" && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl text-center font-semibold">
          Pengajuan Ditolak
        </div>
      )}
    </div>
  );
}
