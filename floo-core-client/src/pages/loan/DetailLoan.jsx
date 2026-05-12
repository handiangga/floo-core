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

    // STATUS
    isSigned,
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

  // ======================================
  // LOADING
  // ======================================
  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-white rounded-[32px] p-10 border border-gray-100 text-center shadow-sm">
            <div className="animate-pulse space-y-5">
              <div className="h-8 w-56 bg-gray-200 rounded mx-auto" />

              <div className="h-4 w-72 bg-gray-100 rounded mx-auto" />

              <div className="h-52 bg-gray-100 rounded-[28px]" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ======================================
  // NOT FOUND
  // ======================================
  if (!loan) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-white border border-gray-100 rounded-[32px] p-12 text-center shadow-sm">
            <div className="text-6xl mb-5">📭</div>

            <h2 className="text-2xl font-bold text-gray-800">
              Loan Tidak Ditemukan
            </h2>

            <p className="text-gray-500 mt-2">
              Data loan yang kamu cari tidak tersedia.
            </p>

            <button
              onClick={() => navigate("/loans")}
              className="
                mt-6
                bg-black
                hover:bg-gray-800
                text-white
                px-6
                py-3
                rounded-2xl
                transition
                font-medium
              "
            >
              Kembali
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // ======================================
  // UI
  // ======================================
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* ======================================
            HEADER
        ====================================== */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* LEFT */}
          <div>
            <button
              onClick={() => navigate("/loans")}
              className="
                text-sm
                mb-3
                text-gray-500
                hover:text-black
                transition
              "
            >
              ← Kembali
            </button>

            <h1 className="text-4xl font-bold text-gray-800">Detail Loan</h1>

            <p className="text-gray-500 mt-2 text-lg">
              {loan.Employee?.name || "-"}
            </p>
          </div>

          {/* STATUS */}
          <div>
            <span
              className={`
                inline-flex
                items-center
                gap-2
                px-5
                py-3
                rounded-2xl
                text-sm
                font-bold
                border
                shadow-sm
                ${
                  loan.status === "paid"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : loan.status === "ongoing"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : loan.status === "signed"
                        ? "bg-violet-50 border-violet-200 text-violet-700"
                        : loan.status.includes("reject")
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                }
              `}
            >
              {loan.status.replaceAll("_", " ").toUpperCase()}
            </span>
          </div>
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
            ACTIONS
        ====================================== */}
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

        {/* ======================================
            DOCUMENT SECTION
        ====================================== */}
        <LoanDocumentSection loan={loan} />

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
