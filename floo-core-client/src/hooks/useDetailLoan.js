import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Swal from "sweetalert2";

import api from "../api/api";

// ======================================
// HOOK
// ======================================
export default function useDetailLoan() {
  const { id } = useParams();

  const navigate = useNavigate();

  // ======================================
  // STATE
  // ======================================
  const [loan, setLoan] = useState(null);

  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [paymentLoading, setPaymentLoading] = useState(false);

  const [disburseLoading, setDisburseLoading] = useState(false);

  // ======================================
  // PAYMENT
  // ======================================
  const [amount, setAmount] = useState("");

  const [proofFile, setProofFile] = useState(null);

  const [preview, setPreview] = useState(null);

  // ======================================
  // DISBURSE
  // ======================================
  const [disburseProof, setDisburseProof] = useState(null);

  // ======================================
  // USER
  // ======================================
  const user = JSON.parse(localStorage.getItem("user"));

  // ======================================
  // FETCH LOAN
  // ======================================
  const fetchLoan = async () => {
    try {
      setLoading(true);

      // =========================
      // LOAN DETAIL
      // =========================
      const loanRes = await api.get(`/loans/${id}`);

      const loanData = loanRes?.data?.data || loanRes?.data;

      console.log("Loan Full :", loanData);

      setLoan(loanData);

      // =========================
      // TRANSACTIONS
      // =========================
      try {
        const trxRes = await api.get(`/transactions?loan_id=${id}`);

        console.log("TRANSACTIONS :", trxRes.data);

        const trxData = trxRes?.data?.data?.data || trxRes?.data?.data || [];

        setTransactions(Array.isArray(trxData) ? trxData : []);
      } catch (trxErr) {
        console.error("Get transactions failed:", trxErr);

        setTransactions([]);
      }
    } catch (err) {
      console.error(err);

      Swal.fire("Error", "Gagal mengambil detail loan", "error");

      navigate("/loans");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // EFFECT
  // ======================================
  useEffect(() => {
    fetchLoan();
  }, [id]);

  // ======================================
  // PAYMENT
  // ======================================
  const handlePayment = async () => {
    try {
      if (!amount) {
        return Swal.fire("Error", "Nominal wajib diisi", "error");
      }

      if (!proofFile) {
        return Swal.fire("Error", "Upload bukti pembayaran", "error");
      }

      const cleanAmount = Number(String(amount).replace(/\D/g, ""));

      if (!cleanAmount || cleanAmount <= 0) {
        return Swal.fire("Error", "Nominal tidak valid", "error");
      }

      if (cleanAmount > loan.remaining_amount) {
        return Swal.fire("Error", "Melebihi sisa pinjaman", "error");
      }

      setPaymentLoading(true);

      const formData = new FormData();

      formData.append("loan_id", loan.id);

      formData.append("amount", cleanAmount);

      formData.append("proof", proofFile);

      await api.post("/transactions/payment", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Berhasil", "Pembayaran berhasil", "success");

      // RESET
      setAmount("");

      setProofFile(null);

      setPreview(null);

      // REFRESH
      fetchLoan();
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Error",
        err?.response?.data?.message || "Pembayaran gagal",
        "error",
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // ======================================
  // MANAGER APPROVE
  // ======================================
  const handleApproveManager = async () => {
    try {
      setPaymentLoading(true);

      await api.post(`/loans/${id}/approve-manager`);

      Swal.fire("Berhasil", "Pengajuan diteruskan ke owner", "success");

      fetchLoan();
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Error",
        err?.response?.data?.message || "Approve manager failed",
        "error",
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // ======================================
  // MANAGER REJECT
  // ======================================
  const handleRejectManager = async () => {
    const { value } = await Swal.fire({
      title: "Alasan Reject",
      input: "textarea",
      inputPlaceholder: "Masukkan alasan reject...",
      showCancelButton: true,
    });

    if (!value) return;

    try {
      setPaymentLoading(true);

      await api.post(`/loans/${id}/reject-manager`, {
        reason: value,
      });

      Swal.fire("Berhasil", "Pengajuan ditolak manager", "success");

      fetchLoan();
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Error",
        err?.response?.data?.message || "Reject manager failed",
        "error",
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // ======================================
  // OWNER APPROVE
  // ======================================
  const handleApproveOwner = async () => {
    try {
      setPaymentLoading(true);

      await api.post(`/loans/${id}/approve-owner`);

      Swal.fire("Berhasil", "Pengajuan disetujui owner", "success");

      fetchLoan();
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Error",
        err?.response?.data?.message || "Approve owner failed",
        "error",
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // ======================================
  // OWNER REJECT
  // ======================================
  const handleRejectOwner = async () => {
    const { value } = await Swal.fire({
      title: "Alasan Reject",
      input: "textarea",
      inputPlaceholder: "Masukkan alasan reject...",
      showCancelButton: true,
    });

    if (!value) return;

    try {
      setPaymentLoading(true);

      await api.post(`/loans/${id}/reject-owner`, {
        reason: value,
      });

      Swal.fire("Berhasil", "Pengajuan ditolak owner", "success");

      fetchLoan();
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Error",
        err?.response?.data?.message || "Reject owner failed",
        "error",
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // ======================================
  // DOWNLOAD PDF
  // ======================================
  const handleDownloadPdf = async () => {
    try {
      window.open(`${import.meta.env.VITE_API_URL}/loans/${id}/pdf`, "_blank");
    } catch (err) {
      console.error(err);

      Swal.fire("Error", "Download PDF gagal", "error");
    }
  };

  // ======================================
  // UPLOAD SIGNATURE
  // ======================================
  const handleUploadSignature = async () => {
    const { value: file } = await Swal.fire({
      title: "Upload Dokumen TTD",
      input: "file",
      inputAttributes: {
        accept: ".pdf,image/*",
      },
    });

    if (!file) return;

    try {
      setPaymentLoading(true);

      const formData = new FormData();

      formData.append("signed_contract", file);

      await api.post(`/loans/${id}/upload-contract`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Berhasil", "Dokumen berhasil diupload", "success");

      fetchLoan();
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Error",
        err?.response?.data?.message || "Upload gagal",
        "error",
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // ======================================
  // DISBURSE
  // ======================================
  const handleDisburse = async () => {
    try {
      if (!disburseProof) {
        return Swal.fire("Error", "Upload bukti pencairan", "error");
      }

      setDisburseLoading(true);

      const formData = new FormData();

      formData.append("proof", disburseProof);

      await api.post(`/loans/${id}/disburse`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Berhasil", "Dana berhasil dicairkan", "success");

      setDisburseProof(null);

      fetchLoan();
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Error",
        err?.response?.data?.message || "Disburse gagal",
        "error",
      );
    } finally {
      setDisburseLoading(false);
    }
  };

  // ======================================
  // STATUS
  // ======================================
  const isPending =
    loan?.status === "pending_manager" || loan?.status === "pending_owner";

  const isWaitingSignature = loan?.status === "waiting_signature";

  const isSigned = loan?.status === "signed";

  const isDisbursed = loan?.status === "ongoing" || loan?.status === "paid";

  const isRejected =
    loan?.status === "rejected_manager" || loan?.status === "rejected_owner";

  const canPay = loan?.status === "ongoing";

  // ======================================
  // RETURN
  // ======================================
  return {
    // DATA
    loan,
    transactions,
    user,

    // STATE
    loading,
    paymentLoading,
    disburseLoading,

    // FORM
    amount,
    setAmount,

    proofFile,
    setProofFile,

    preview,
    setPreview,

    // DISBURSE
    disburseProof,
    setDisburseProof,

    // STATUS
    isPending,
    isWaitingSignature,
    isSigned,
    isDisbursed,
    isRejected,
    canPay,

    // ACTIONS
    handlePayment,
    handleDisburse,

    handleApproveManager,
    handleRejectManager,

    handleApproveOwner,
    handleRejectOwner,

    handleDownloadPdf,
    handleUploadSignature,

    // NAV
    navigate,

    // REFRESH
    fetchLoan,
  };
}
