import { useEffect, useState } from "react";
import Layout from "../../components/layout/LayoutTest";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/api";
import { formatRupiah } from "../../utils/format";

export default function DetailLoan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const BASE_URL = "https://floo-core-backend.onrender.com";

  const [loan, setLoan] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [payAmount, setPayAmount] = useState("");
  const [proof, setProof] = useState(null);
  const [preview, setPreview] = useState(null);

  const parseNumber = (val) => Number(val.toString().replace(/\D/g, "")) || 0;

  const fetchData = async () => {
    try {
      setLoading(true);

      const [loanRes, trxRes] = await Promise.all([
        api.get(`/loans/${id}`),
        api.get(`/transactions?loan_id=${id}`),
      ]);

      setLoan(loanRes.data.data);
      setTransactions(trxRes.data.data.data || []);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal ambil data",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const progress = loan
    ? Math.min(
        100,
        ((loan.total_amount - loan.remaining_amount) / loan.total_amount) * 100,
      )
    : 0;

  const isLunas = loan?.remaining_amount === 0;

  const handlePay = async () => {
    try {
      const amount = parseNumber(payAmount);

      if (!amount) return Swal.fire("Error", "Isi nominal", "warning");
      if (!proof) return Swal.fire("Error", "Upload bukti", "warning");

      const confirm = await Swal.fire({
        title: "Konfirmasi",
        text: `Bayar ${formatRupiah(amount)} ?`,
        icon: "question",
        showCancelButton: true,
      });

      if (!confirm.isConfirmed) return;

      const formData = new FormData();
      formData.append("loan_id", id);
      formData.append("amount", amount);
      formData.append("proof", proof);

      await api.post("/transactions", formData);

      Swal.fire("Berhasil", "Pembayaran sukses", "success");

      setPayAmount("");
      setProof(null);
      setPreview(null);

      fetchData();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Gagal bayar", "error");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="h-40 bg-gray-200 animate-pulse rounded-2xl" />
      </Layout>
    );
  }

  if (!loan) return <Layout>Data tidak ditemukan</Layout>;

  return (
    <Layout>
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/loans")}
          className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Kembali
        </button>

        <div>
          <h1 className="text-2xl font-bold">Loan Detail</h1>
          <p className="text-gray-500 text-sm">
            {loan.Employee?.name} ({loan.Employee?.position})
          </p>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border space-y-5">
        {/* TOP */}
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Total" value={loan.total_amount} />
          <Stat label="Sisa" value={loan.remaining_amount} red />
          <Stat label="Cicilan" value={loan.installment} />
        </div>

        {/* PROGRESS */}
        <div>
          <div className="w-full bg-gray-200 h-3 rounded-full">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {progress.toFixed(0)}% selesai
          </p>
        </div>

        {/* BREAKDOWN */}
        <div className="bg-gray-50 p-4 rounded-xl text-sm flex justify-between">
          <div>
            <p className="text-gray-500">Pokok</p>
            <p className="font-semibold">
              {formatRupiah(loan.principal_amount)}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Bunga ({loan.interest_rate}%)</p>
            <p className="font-semibold">
              {formatRupiah(loan.interest_amount)}
            </p>
          </div>
        </div>
      </div>

      {/* PAYMENT */}
      {!isLunas && (
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border space-y-4">
          <h2 className="font-semibold text-lg">Bayar Cicilan</h2>

          <div className="flex gap-2">
            <input
              value={payAmount}
              onChange={(e) => {
                const raw = parseNumber(e.target.value);
                setPayAmount(raw ? raw.toLocaleString("id-ID") : "");
              }}
              className="border px-4 py-3 rounded-xl w-full text-lg"
              placeholder="0"
            />

            <button
              onClick={() =>
                setPayAmount(loan.installment.toLocaleString("id-ID"))
              }
              className="bg-gray-200 px-4 rounded-xl"
            >
              Cicilan
            </button>

            <button
              onClick={() =>
                setPayAmount(loan.remaining_amount.toLocaleString("id-ID"))
              }
              className="bg-green-500 text-white px-4 rounded-xl"
            >
              Lunas
            </button>
          </div>

          {/* UPLOAD */}
          <div className="border-2 border-dashed p-4 rounded-xl text-center">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                setProof(file);
                setPreview(URL.createObjectURL(file));
              }}
            />

            {preview && (
              <img
                src={preview}
                className="w-32 mx-auto mt-3 rounded-xl shadow cursor-pointer"
                onClick={() => Swal.fire({ imageUrl: preview })}
              />
            )}
          </div>

          <button
            onClick={handlePay}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-semibold"
          >
            Bayar Sekarang
          </button>
        </div>
      )}

      {/* HISTORY */}
      <div className="bg-white rounded-3xl shadow-lg border overflow-hidden">
        <div className="p-4 font-semibold border-b">Riwayat Pembayaran</div>

        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            Belum ada pembayaran
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Tanggal</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Sisa</th>
                <th className="p-4 text-left">Bukti</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((trx) => (
                <tr key={trx.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    {new Date(trx.createdAt).toLocaleDateString("id-ID")}
                  </td>

                  <td className="p-4 text-green-600 font-semibold">
                    + {formatRupiah(trx.amount)}
                  </td>

                  <td className="p-4">{formatRupiah(trx.remaining_after)}</td>

                  <td className="p-4">
                    {trx.proof && (
                      <img
                        src={`${BASE_URL}/uploads/${trx.proof}`}
                        className="w-10 rounded cursor-pointer hover:scale-110 transition"
                        onClick={() =>
                          Swal.fire({
                            imageUrl: `${BASE_URL}/uploads/${trx.proof}`,
                          })
                        }
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

function Stat({ label, value, red }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${red ? "text-red-500" : ""}`}>
        {formatRupiah(value)}
      </p>
    </div>
  );
}
