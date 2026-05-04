import Swal from "sweetalert2";

export default function LoanActions({
  loan,
  user,
  actionLoading,
  onApproveManager,
  onApproveOwner,
}) {
  const handleManager = async () => {
    const confirm = await Swal.fire({
      title: "Approve Manager?",
      icon: "question",
      showCancelButton: true,
    });

    if (confirm.isConfirmed) {
      onApproveManager();
    }
  };

  const handleOwner = async () => {
    const confirm = await Swal.fire({
      title: "Approve Owner & Cairkan?",
      icon: "question",
      showCancelButton: true,
    });

    if (confirm.isConfirmed) {
      onApproveOwner();
    }
  };

  return (
    <>
      {loan.status === "pending_manager" && user?.role === "manager" && (
        <button
          onClick={handleManager}
          disabled={actionLoading}
          className="mt-4 w-full bg-yellow-500 text-white py-3 rounded-xl"
        >
          Approve Manager
        </button>
      )}

      {loan.status === "pending_owner" && user?.role === "owner" && (
        <button
          onClick={handleOwner}
          disabled={actionLoading}
          className="mt-4 w-full bg-orange-500 text-white py-3 rounded-xl"
        >
          Approve Owner & Cairkan
        </button>
      )}
    </>
  );
}
