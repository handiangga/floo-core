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

  const [amount, setAmount] = useState("");

  const [note, setNote] = useState("");

  const [proofFile, setProofFile] = useState(null);

  // ======================================
  // FETCH LOAN
  // ======================================
  const fetchLoan = async () => {
    try {
      setLoading(true);

      // ======================================
      // LOAN
      // ======================================
      const loanRes = await api.get(`/loans/${id}`);

      console.log("Loan Full :", loanRes.data.data);

      setLoan(loanRes.data.data);

      // ======================================
      // TRANSACTIONS
      // ======================================
      const trxRes = await api.get(`/transactions?loan_id=${id}`);

      console.log("TRANSACTIONS :", trxRes.data);

      // 🔥 FIX RESPONSE
      const trxData =
        trxRes?.data?.data?.data ||
        trxRes?.data?.data?.rows ||
        trxRes?.data?.data ||
        trxRes?.data ||
        [];

      setTransactions(Array.isArray(trxData) ? trxData : []);
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed fetch loan detail",
      });

      navigate("/loans");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // INIT
  // ======================================
  useEffect(() => {
    fetchLoan();
  }, [id]);

  // ======================================
  // STATUS
  // ======================================
  const status = loan?.status;

  const isPending = status === "pending_manager" || status === "pending_owner";

  const isWaitingSignature = status === "waiting_signature";

  const isSigned = status === "signed";

  const isOngoing = status === "ongoing";

  const isPaid = status === "paid";

  const canPay = status === "ongoing";

  // ======================================
  // PAYMENT
  // ======================================
  const handlePayment = async () => {
    try {
      if (!amount) {
        return Swal.fire({
          icon: "warning",
          title: "Nominal wajib diisi",
        });
      }

      setPaymentLoading(true);

      const formData = new FormData();

      formData.append("loan_id", loan.id);

      formData.append("amount", Number(String(amount).replace(/\D/g, "")));

      formData.append("note", note || "");

      if (proofFile) {
        formData.append("proof", proofFile);
      }

      await api.post("/transactions", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Pembayaran berhasil dicatat",
      });

      setAmount("");
      setNote("");
      setProofFile(null);

      fetchLoan();
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Payment failed",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  // ======================================
  // DISBURSE
  // ======================================
  const handleDisburse = async () => {
    try {
      if (!proofFile) {
        return Swal.fire({
          icon: "warning",
          title: "Upload bukti pencairan terlebih dahulu",
        });
      }

      const confirm = await Swal.fire({
        title: "Cairkan dana?",
        text: "Dana akan dicairkan dan status loan berubah menjadi ongoing.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, cairkan",
      });

      if (!confirm.isConfirmed) return;

      setDisburseLoading(true);

      const formData = new FormData();

      formData.append("proof", proofFile);

      await api.post(`/loans/${loan.id}/disburse`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Dana berhasil dicairkan",
      });

      setProofFile(null);

      fetchLoan();
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Disbursement failed",
      });
    } finally {
      setDisburseLoading(false);
    }
  };

  // ======================================
  // REFRESH
  // ======================================
  const refresh = fetchLoan;

  // ======================================
  // RETURN
  // ======================================
  return {
    // DATA
    loan,
    transactions,

    // USER
    user: JSON.parse(localStorage.getItem("user")),

    // STATE
    loading,
    paymentLoading,
    disburseLoading,

    // FORM
    amount,
    setAmount,

    note,
    setNote,

    proofFile,
    setProofFile,

    // PREVIEW
    preview: proofFile ? URL.createObjectURL(proofFile) : null,

    setPreview: () => {},

    // DISBURSE
    disburseProof: proofFile,
    setDisburseProof: setProofFile,

    // STATUS
    status,

    isPending,
    isWaitingSignature,
    isSigned,
    isOngoing,
    isPaid,

    isDisbursed: isOngoing,

    isRejected: status === "rejected_manager" || status === "rejected_owner",

    canPay,

    // ACTION
    handlePayment,
    handleDisburse,
    refresh,

    // DUMMY
    handleApproveManager: () => {},
    handleRejectManager: () => {},
    handleApproveOwner: () => {},
    handleRejectOwner: () => {},
    handleDownloadPdf: () => {},
    handleUploadSignature: () => {},

    // NAV
    navigate,
  };
}
