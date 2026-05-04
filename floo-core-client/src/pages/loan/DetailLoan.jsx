import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import Swal from "sweetalert2";

import { getUser } from "../../utils/auth";
import { formatRupiah, parseNumber } from "../../utils/format";

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

  // PAYMENT STATE
  const [payAmount, setPayAmount] = useState("");
  const [proof, setProof] = useState(null);
  const [preview, setPreview] = useState(null);

  // =========================
  // FETCH DATA
  // =========================
  const fetchDetail = async () => {
    try {
      const res = await api.get(`/loans/${id}`);
      setLoan(res.data.data);

      const trx = await api.get(`/transactions?loan_id=${id}`);
      setTransactions(trx.data.data || []);
    } catch (err) {
      Swal.fire("Error", "Gagal load detail loan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // =========================
  // APPROVAL
  // =========================
  const handleApproveManager = async () => {
    try {
      setActionLoading(true);

      await api.post(`/loans/${id}/approve-manager`);

      Swal.fire("Success", "Approved by manager", "success");

      // 🔥 redirect biar gak error 403
      navigate("/loans");
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveOwner = async () => {
    try {
      setActionLoading(true);

      await api.post(`/loans/${id}/approve-owner`);

      Swal.fire("Success", "Loan approved & disbursed", "success");

      // 🔥 redirect
      navigate("/loans");
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // PAYMENT
  // =========================
  const handlePay = async () => {
    try {
      if (!payAmount) {
        return Swal.fire("Warning", "Masukkan nominal", "warning");
      }

      setActionLoading(true);

      let proofUrl = null;

      // 🔥 upload dulu kalau ada file
      if (proof) {
        const formData = new FormData();
        formData.append("proof", proof);

        const upload = await api.post("/upload", formData);

        proofUrl = upload.data.data?.proof;
      }

      await api.post("/transactions", {
        loan_id: loan.id,
        amount: parseNumber(payAmount),
        proof: proofUrl,
      });

      Swal.fire("Success", "Pembayaran berhasil", "success");

      setPayAmount("");
      setProof(null);
      setPreview(null);

      fetchDetail();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // STATE HELPER
  // =========================
  const isPending =
    loan?.status === "pending_manager" || loan?.status === "pending_owner";

  const isOngoing = loan?.status === "ongoing";

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!loan) {
    return <div className="p-6">Loan tidak ditemukan</div>;
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6">
      {/* HEADER */}
      <button onClick={() => navigate("/loans")} className="text-sm mb-2">
        ← Kembali
      </button>

      <h1 className="text-2xl font-bold">Loan Detail</h1>
      <p className="text-gray-500 mb-4">{loan.Employee?.name || "-"}</p>

      {/* INFO */}
      <LoanInfoCard loan={loan} />

      {/* ACTIONS */}
      <LoanActions
        loan={loan}
        user={user}
        actionLoading={actionLoading}
        onApproveManager={handleApproveManager}
        onApproveOwner={handleApproveOwner}
      />

      {/* ALERT */}
      {isPending && (
        <div className="bg-yellow-50 p-4 mt-4 rounded-xl text-yellow-600 text-sm">
          ⏳ Menunggu approval sebelum bisa dibayar
        </div>
      )}

      {/* PAYMENT */}
      {isOngoing && (
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
  );
}
