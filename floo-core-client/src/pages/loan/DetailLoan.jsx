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

  const [payAmount, setPayAmount] = useState("");
  const [proof, setProof] = useState(null);
  const [preview, setPreview] = useState(null);

  // =========================
  // 🔥 FETCH DATA
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

  const fetchTransactions = async () => {
    try {
      const res = await api.get(`/transactions?loan_id=${id}`);
      const trx = res.data?.data?.data || [];
      setTransactions(Array.isArray(trx) ? trx : []);
    } catch {
      setTransactions([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDetail(), fetchTransactions()]);
      setLoading(false);
    };

    init();
  }, [id]);

  // =========================
  // 🔥 HELPERS
  // =========================
  const parseNumber = (val) => {
    if (!val) return 0;
    return Number(val.toString().replace(/\./g, "")) || 0;
  };

  const isPending =
    loan?.status === "pending_manager" || loan?.status === "pending_owner";

  const isOngoing = loan?.status === "ongoing";

  // =========================
  // 🔥 APPROVAL
  // =========================
  const handleApproveManager = async () => {
    try {
      setActionLoading(true);
      await api.post(`/loans/${loan.id}/approve-manager`);
      Swal.fire("Success", "Approved by manager", "success");
      navigate("/loans");
    } catch {
      Swal.fire("Error", "Gagal approve", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveOwner = async () => {
    try {
      setActionLoading(true);
      await api.post(`/loans/${loan.id}/approve-owner`);
      Swal.fire("Success", "Approved by owner", "success");
      navigate("/loans");
    } catch {
      Swal.fire("Error", "Gagal approve", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // 🔥 PAYMENT (FIX FINAL)
  // =========================
  const handlePay = async () => {
    try {
      const amount = parseNumber(payAmount);

      // validasi nominal
      if (!amount || amount <= 0) {
        return Swal.fire("Error", "Nominal tidak valid", "error");
      }

      // 🔥 WAJIB upload bukti
      if (!proof) {
        return Swal.fire("Error", "Upload bukti pembayaran dulu", "error");
      }

      setActionLoading(true);

      // 🔥 LANGSUNG FORM DATA (TANPA /upload)
      const formData = new FormData();
      formData.append("loan_id", loan.id);
      formData.append("amount", amount);
      formData.append("proof", proof); // wajib "proof"

      await api.post("/transactions", formData);

      Swal.fire("Success", "Pembayaran berhasil", "success");

      // reset state
      setPayAmount("");
      setProof(null);
      setPreview(null);

      // refresh data
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
  // 🔥 LOADING
  // =========================
  if (loading || !loan) {
    return (
      <Layout>
        <div className="p-6">Loading...</div>
      </Layout>
    );
  }

  // =========================
  // 🔥 UI
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
          onApproveOwner={handleApproveOwner}
        />

        {/* STATUS */}
        {isPending && (
          <div className="bg-yellow-50 p-4 rounded-xl text-yellow-600 text-sm">
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
    </Layout>
  );
}
