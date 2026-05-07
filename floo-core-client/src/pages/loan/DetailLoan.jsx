import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import Layout from "../../components/layout/LayoutTest";
import api from "../../api/api";
import { getUser } from "../../utils/auth";

import LoanInfoCard from "../../components/Loan/LoanInfoCard";
import LoanActions from "../../components/Loan/LoanActions";
import LoanPayment from "../../components/Loan/LoanPayment";
import LoanHistory from "../../components/Loan/LoanHistory";

export default function DetailLoan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [loan, setLoan] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // PAYMENT
  const [payAmount, setPayAmount] = useState("");
  const [proof, setProof] = useState(null);
  const [preview, setPreview] = useState(null);

  // SIGNATURE
  const [signature, setSignature] = useState(null);

  // =========================
  // FETCH DETAIL
  // =========================
  const fetchDetail = async () => {
    try {
      const res = await api.get(`/loans/${id}`);
      setLoan(res.data.data);
    } catch (err) {
      Swal.fire("Error", "Gagal load loan", "error");
      navigate("/loans");
    }
  };

  // =========================
  // FETCH TRANSACTIONS
  // =========================
  const fetchTransactions = async () => {
    try {
      const res = await api.get(`/transactions?loan_id=${id}`);

      const trx = res.data?.data?.data || [];

      setTransactions(Array.isArray(trx) ? trx : []);
    } catch {
      setTransactions([]);
    }
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      await Promise.all([fetchDetail(), fetchTransactions()]);

      setLoading(false);
    };

    init();
  }, [id]);

  // =========================
  // HELPERS
  // =========================
  const parseNumber = (val) => {
    if (!val) return 0;

    return Number(val.toString().replace(/\./g, "")) || 0;
  };

  const isPending =
    loan?.status === "pending_manager" || loan?.status === "pending_owner";

  const isApprovedOwner = loan?.status === "approved_owner";

  const isSigned = loan?.status === "signed";

  const isDisbursed = loan?.status === "disbursed";

  // =========================
  // APPROVE MANAGER
  // =========================
  const handleApproveManager = async () => {
    try {
      setActionLoading(true);

      await api.post(`/loans/${loan.id}/approve-manager`);

      Swal.fire("Success", "Approved by manager", "success");

      await fetchDetail();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal approve",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // REJECT MANAGER
  // =========================
  const handleRejectManager = async () => {
    try {
      const { value: reason } = await Swal.fire({
        title: "Reject reason",
        input: "text",
        inputPlaceholder: "Masukkan alasan reject",
        showCancelButton: true,
      });

      if (!reason) return;

      setActionLoading(true);

      await api.post(`/loans/${loan.id}/reject-manager`, { reason });

      Swal.fire("Success", "Rejected by manager", "success");

      navigate("/loans");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal reject",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // APPROVE OWNER
  // =========================
  const handleApproveOwner = async () => {
    try {
      setActionLoading(true);

      await api.post(`/loans/${loan.id}/approve-owner`);

      Swal.fire("Success", "Approved by owner", "success");

      await fetchDetail();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal approve",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // REJECT OWNER
  // =========================
  const handleRejectOwner = async () => {
    try {
      const { value: reason } = await Swal.fire({
        title: "Reject reason",
        input: "text",
        inputPlaceholder: "Masukkan alasan reject",
        showCancelButton: true,
      });

      if (!reason) return;

      setActionLoading(true);

      await api.post(`/loans/${loan.id}/reject-owner`, { reason });

      Swal.fire("Success", "Rejected by owner", "success");

      navigate("/loans");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal reject",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // DOWNLOAD PDF
  // =========================
  const handleDownloadPdf = () => {
    window.open(
      `${import.meta.env.VITE_API_URL}/loans/${loan.id}/pdf`,
      "_blank",
    );
  };

  // =========================
  // UPLOAD SIGNATURE
  // =========================
  const handleUploadSignature = async () => {
    try {
      const { value: file } = await Swal.fire({
        title: "Upload Tanda Tangan",
        input: "file",
        inputAttributes: {
          accept: "image/*,.pdf",
        },
        showCancelButton: true,
      });

      if (!file) return;

      setSignature(file);

      setActionLoading(true);

      const formData = new FormData();

      formData.append("signed_contract", file);

      await api.post(`/loans/${loan.id}/upload-signed-contract`, formData);

      Swal.fire("Success", "TTD berhasil upload", "success");

      await fetchDetail();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal upload TTD",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // DISBURSE
  // =========================
  const handleDisburse = async () => {
    try {
      setActionLoading(true);

      await api.post(`/loans/${loan.id}/disburse`);

      Swal.fire("Success", "Dana berhasil dicairkan", "success");

      await fetchDetail();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal cairkan dana",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // PAYMENT
  // =========================
  const handlePay = async () => {
    try {
      const amount = parseNumber(payAmount);

      if (!amount || amount <= 0) {
        return Swal.fire("Error", "Nominal tidak valid", "error");
      }

      if (!proof) {
        return Swal.fire("Error", "Upload bukti pembayaran dulu", "error");
      }

      setActionLoading(true);

      const formData = new FormData();

      formData.append("loan_id", loan.id);
      formData.append("amount", amount);
      formData.append("proof", proof);

      await api.post("/transactions", formData);

      Swal.fire("Success", "Pembayaran berhasil", "success");

      setPayAmount("");
      setProof(null);
      setPreview(null);

      await Promise.all([fetchDetail(), fetchTransactions()]);
    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Gagal bayar",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading || !loan) {
    return (
      <Layout>
        <div className="p-6">Loading...</div>
      </Layout>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* HEADER */}
        <div>
          <button
            onClick={() => navigate("/loans")}
            className="text-sm mb-2 text-gray-500 hover:text-black"
          >
            ← Kembali
          </button>

          <h1 className="text-2xl font-semibold">Loan Detail</h1>

          <p className="text-gray-500">{loan.Employee?.name || "-"}</p>
        </div>

        {/* INFO */}
        <LoanInfoCard loan={loan} />

        {/* ACTION */}
        <LoanActions
          loan={loan}
          user={user}
          actionLoading={actionLoading}
          onApproveManager={handleApproveManager}
          onRejectManager={handleRejectManager}
          onApproveOwner={handleApproveOwner}
          onRejectOwner={handleRejectOwner}
          onDownloadPdf={handleDownloadPdf}
          onUploadSignature={handleUploadSignature}
          onDisburse={handleDisburse}
        />

        {/* STATUS */}
        {isPending && (
          <div className="bg-yellow-50 p-4 rounded-xl text-yellow-700 text-sm">
            ⏳ Menunggu approval
          </div>
        )}

        {isApprovedOwner && (
          <div className="bg-blue-50 p-4 rounded-xl text-blue-700 text-sm">
            ✍️ Menunggu upload tanda tangan
          </div>
        )}

        {isSigned && (
          <div className="bg-purple-50 p-4 rounded-xl text-purple-700 text-sm">
            💰 Siap dicairkan
          </div>
        )}

        {/* PAYMENT */}
        {isDisbursed && (
          <LoanPayment
            loan={loan}
            payAmount={payAmount}
            setPayAmount={setPayAmount}
            handlePay={handlePay}
            actionLoading={actionLoading}
            parseNumber={parseNumber}
            proof={proof}
            setProof={setProof}
            preview={preview}
            setPreview={setPreview}
          />
        )}

        {/* HISTORY */}
        <LoanHistory transactions={transactions} />
      </div>
    </Layout>
  );
}
