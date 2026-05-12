import Layout from "../../components/layout/LayoutTest";

import LoanInfoCard from "../../components/Loan/LoanInfoCard";
import LoanActions from "../../components/Loan/LoanActions";
import LoanPayment from "../../components/Loan/LoanPayment";
import LoanHistory from "../../components/Loan/LoanHistory";

import LoanDocumentSection from "../../components/Loan/LoanDocumentSection";
import LoanStatusAlert from "../../components/Loan/LoanStatusAlert";

import useDetailLoan from "../../hooks/useDetailLoan";

export default function DetailLoan() {
  const {
    // DATA
    loan,
    transactions = [],
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
  } = useDetailLoan();

  // =========================
  // LOADING
  // =========================
  if (loading || !loan) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-white rounded-3xl p-10 text-center shadow">
            Loading...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* ======================================
            HEADER
        ====================================== */}
        <div>
          <button
            onClick={() => navigate("/loans")}
            className="text-sm mb-3 text-gray-500 hover:text-black transition"
          >
            ← Kembali
          </button>

          <h1 className="text-4xl font-bold text-gray-800">Loan Detail</h1>

          <p className="text-gray-500 mt-2 text-lg">
            {loan.Employee?.name || "-"}
          </p>
        </div>

        {/* ======================================
            STATUS ALERT
        ====================================== */}
        <LoanStatusAlert loan={loan} />

        {/* ======================================
            INFO CARD
        ====================================== */}
        <LoanInfoCard loan={loan} />

        {/* ======================================
            DISBURSE PROOF
        ====================================== */}
        {isSigned && user?.role === "admin" && (
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Upload Bukti Pencairan
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Upload bukti transfer sebelum dana dicairkan.
              </p>
            </div>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setDisburseProof(e.target.files[0])}
              className="
                w-full
                border
                rounded-2xl
                p-4
                text-sm
              "
            />

            {disburseProof && (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-700">
                ✅ {disburseProof.name}
              </div>
            )}
          </div>
        )}

        {/* ======================================
            ACTIONS
        ====================================== */}
        {!isRejected && (
          <LoanActions
            loan={loan}
            user={user}
            actionLoading={paymentLoading || disburseLoading}
            onApproveManager={handleApproveManager}
            onRejectManager={handleRejectManager}
            onApproveOwner={handleApproveOwner}
            onRejectOwner={handleRejectOwner}
            onDownloadPdf={handleDownloadPdf}
            onUploadSignature={handleUploadSignature}
            onDisburse={handleDisburse}
          />
        )}

        {/* ======================================
            DOCUMENTS
        ====================================== */}
        {(isWaitingSignature ||
          isSigned ||
          isDisbursed ||
          loan?.status === "paid") && <LoanDocumentSection loan={loan} />}

        {/* ======================================
            PAYMENT
        ====================================== */}
        {canPay && (
          <LoanPayment
            loan={loan}
            payAmount={amount}
            setPayAmount={setAmount}
            handlePay={handlePayment}
            actionLoading={paymentLoading}
            proof={proofFile}
            setProof={setProofFile}
            preview={preview}
            setPreview={setPreview}
            parseNumber={(v) => Number(String(v).replace(/\D/g, ""))}
          />
        )}

        {/* ======================================
            HISTORY
        ====================================== */}
        <LoanHistory transactions={transactions || []} />
      </div>
    </Layout>
  );
}
