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

  // DISBURSE PROOF
  const [disburseProof, setDisburseProof] = useState(null);

  // =========================
  // FETCH DETAIL
  // =========================
  const fetchDetail = async () => {
    try {
      const res = await api.get(`/loans/${id}`);

      setLoan(res.data.data);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal load loan",
        "error",
      );

      navigate("/loans");
    }
  };

  // =========================
  // FETCH TRANSACTION
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
  // HELPER
  // =========================
  const parseNumber = (val) => {
    if (!val) return 0;

    return Number(val.toString().replace(/\./g, "")) || 0;
  };

  // =========================
  // STATUS
  // =========================
  const isPending =
    loan?.status === "pending_manager" || loan?.status === "pending_owner";

  const isWaitingSignature = loan?.status === "waiting_signature";

  const isSigned = loan?.status === "signed";

  const isDisbursed =
    loan?.status === "ongoing" ||
    loan?.status === "disbursed" ||
    loan?.status === "paid";

  const isPaid = loan?.status === "paid";

  const isRejected =
    loan?.status === "rejected_manager" || loan?.status === "rejected_owner";

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

      await api.post(`/loans/${loan.id}/reject-manager`, {
        reason,
      });

      Swal.fire("Success", "Loan rejected", "success");

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

      await api.post(`/loans/${loan.id}/reject-owner`, {
        reason,
      });

      Swal.fire("Success", "Loan rejected", "success");

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
  const handleDownloadPdf = async () => {
    try {
      if (!loan?.loan_agreement) {
        throw new Error("PDF belum tersedia");
      }

      window.open(loan.loan_agreement, "_blank");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
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

      setActionLoading(true);

      const formData = new FormData();

      formData.append("signed_contract", file);

      await api.post(`/loans/${loan.id}/upload-contract`, formData);

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
      if (!disburseProof) {
        return Swal.fire("Warning", "Upload bukti pencairan dulu", "warning");
      }

      setActionLoading(true);

      const formData = new FormData();

      formData.append("proof", disburseProof);

      await api.post(`/loans/${loan.id}/disburse`, formData);

      Swal.fire("Success", "Dana berhasil dicairkan", "success");

      setDisburseProof(null);

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
      if (loan?.status === "paid") {
        return Swal.fire("Info", "Loan sudah lunas", "info");
      }

      const amount = parseNumber(payAmount);

      if (!amount || amount <= 0) {
        return Swal.fire("Error", "Nominal tidak valid", "error");
      }

      if (amount > loan.remaining_amount) {
        return Swal.fire("Error", "Pembayaran melebihi sisa tagihan", "error");
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

          <h1 className="text-3xl font-bold text-gray-800">Loan Detail</h1>

          <p className="text-gray-500 mt-1">{loan.Employee?.name || "-"}</p>
        </div>

        {/* INFO CARD */}
        <LoanInfoCard loan={loan} />

        {/* DISBURSE PROOF */}
        {isSigned && user?.role === "admin" && (
          <div className="bg-white border rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-700">
              Upload Bukti Pencairan
            </h3>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setDisburseProof(e.target.files[0])}
              className="w-full border rounded-xl p-3"
            />

            {disburseProof && (
              <div className="text-sm text-green-600">
                ✅ {disburseProof.name}
              </div>
            )}
          </div>
        )}

        {/* ACTION */}
        {!isRejected && (
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
        )}

        {/* STATUS INFO */}
        {isPending && (
          <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl text-yellow-700">
            ⏳ Pengajuan sedang menunggu approval
          </div>
        )}

        {/* WAITING SIGNATURE */}
        {isWaitingSignature && (
          <div className="space-y-5">
            <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-2xl text-indigo-700">
              📄 Loan sudah disetujui owner. Silakan download PDF dan upload
              tanda tangan.
            </div>

            {loan.signed_contract_url && (
              <div className="bg-violet-50 border border-violet-200 rounded-3xl p-6">
                <p className="text-violet-700 font-medium mb-4">
                  ✍️ Dokumen perjanjian sudah ditandatangani.
                </p>

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() =>
                      Swal.fire({
                        title: "Dokumen TTD",
                        html: `
                          <iframe
                            src="${loan.signed_contract_url}"
                            width="100%"
                            height="600px"
                            style="border:none;border-radius:12px;"
                          ></iframe>
                        `,
                        width: 900,
                        showCloseButton: true,
                        showConfirmButton: false,
                      })
                    }
                    className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-2xl transition font-medium"
                  >
                    Lihat TTD
                  </button>

                  <a
                    href={loan.signed_contract_url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white border border-violet-300 text-violet-700 px-5 py-3 rounded-2xl hover:bg-violet-100 transition font-medium"
                  >
                    Download TTD
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SIGNED */}
        {isSigned && (
          <div className="space-y-5">
            <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl text-purple-700">
              ✍️ Dokumen sudah ditandatangani dan siap dicairkan.
            </div>

            {loan.signed_contract_url && (
              <div className="bg-violet-50 border border-violet-200 rounded-3xl p-6">
                <p className="text-violet-700 font-medium mb-4">
                  ✍️ Dokumen perjanjian sudah ditandatangani.
                </p>

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() =>
                      Swal.fire({
                        title: "Dokumen TTD",
                        html: `
                          <iframe
                            src="${loan.signed_contract_url}"
                            width="100%"
                            height="600px"
                            style="border:none;border-radius:12px;"
                          ></iframe>
                        `,
                        width: 900,
                        showCloseButton: true,
                        showConfirmButton: false,
                      })
                    }
                    className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-2xl transition font-medium"
                  >
                    Lihat TTD
                  </button>

                  <a
                    href={loan.signed_contract_url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white border border-violet-300 text-violet-700 px-5 py-3 rounded-2xl hover:bg-violet-100 transition font-medium"
                  >
                    Download TTD
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DISBURSED */}
        {isDisbursed && (
          <div className="space-y-5">
            {/* INFO */}
            <div
              className={`border p-5 rounded-2xl ${
                isPaid
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-green-50 border-green-200 text-green-700"
              }`}
            >
              {isPaid
                ? "✅ Loan telah lunas."
                : "💰 Dana sudah berhasil dicairkan."}
            </div>

            {/* ACTION CARDS */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* TTD */}
              {loan?.signed_contract_url && (
                <div className="bg-violet-50 border border-violet-200 rounded-3xl p-6">
                  <p className="text-violet-700 font-semibold mb-4">
                    ✍️ Dokumen TTD
                  </p>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() =>
                        Swal.fire({
                          title: "Dokumen TTD",
                          html: `
                            <iframe
                              src="${loan.signed_contract_url}"
                              width="100%"
                              height="600px"
                              style="border:none;border-radius:12px;"
                            ></iframe>
                          `,
                          width: 900,
                          showCloseButton: true,
                          showConfirmButton: false,
                        })
                      }
                      className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-2xl transition font-medium"
                    >
                      Lihat TTD
                    </button>

                    <a
                      href={loan.signed_contract_url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white border border-violet-300 text-violet-700 px-5 py-3 rounded-2xl hover:bg-violet-100 transition font-medium"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}

              {/* DISBURSEMENT */}
              {loan?.disbursement_proof && (
                <div className="bg-green-50 border border-green-200 rounded-3xl p-6">
                  <p className="text-green-700 font-semibold mb-4">
                    💰 Bukti Pencairan
                  </p>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() =>
                        Swal.fire({
                          imageUrl: loan.disbursement_proof,
                          imageAlt: "Bukti Pencairan",
                          width: 700,
                          showConfirmButton: false,
                          showCloseButton: true,
                          background: "#fff",
                        })
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl transition font-medium"
                    >
                      Lihat Bukti
                    </button>

                    <a
                      href={loan.disbursement_proof}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white border border-green-300 text-green-700 px-5 py-3 rounded-2xl hover:bg-green-100 transition font-medium"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}

              {/* RECEIPT PDF */}
              {loan?.disbursement_receipt_pdf && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-3xl p-6">
                  <p className="text-cyan-700 font-semibold mb-4">
                    📄 Kwitansi Pencairan
                  </p>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() =>
                        Swal.fire({
                          title: "Kwitansi Pencairan",
                          html: `
                            <iframe
                              src="${loan.disbursement_receipt_pdf}"
                              width="100%"
                              height="600px"
                              style="border:none;border-radius:12px;"
                            ></iframe>
                          `,
                          width: 900,
                          showCloseButton: true,
                          showConfirmButton: false,
                        })
                      }
                      className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 rounded-2xl transition font-medium"
                    >
                      Lihat PDF
                    </button>

                    <a
                      href={loan.disbursement_receipt_pdf}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white border border-cyan-300 text-cyan-700 px-5 py-3 rounded-2xl hover:bg-cyan-100 transition font-medium"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}

              {/* SETTLEMENT LETTER */}
              {loan?.settlement_letter && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6">
                  <p className="text-emerald-700 font-semibold mb-4">
                    ✅ Surat Pelunasan
                  </p>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() =>
                        Swal.fire({
                          title: "Surat Pelunasan",
                          html: `
                            <iframe
                              src="${loan.settlement_letter}"
                              width="100%"
                              height="600px"
                              style="border:none;border-radius:12px;"
                            ></iframe>
                          `,
                          width: 900,
                          showCloseButton: true,
                          showConfirmButton: false,
                        })
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl transition font-medium"
                    >
                      Lihat PDF
                    </button>

                    <a
                      href={loan.settlement_letter}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white border border-emerald-300 text-emerald-700 px-5 py-3 rounded-2xl hover:bg-emerald-100 transition font-medium"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAYMENT */}
        {isDisbursed && !isPaid && (
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
