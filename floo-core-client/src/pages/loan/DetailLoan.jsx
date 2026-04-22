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

  // 🔥 FETCH
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

  // 🔥 PROGRESS SAFE
  const progress = loan
    ? Math.min(
        100,
        Math.max(
          0,
          ((loan.total_amount - loan.remaining_amount) / loan.total_amount) *
            100,
        ),
      )
    : 0;

  const isLunas = loan?.remaining_amount === 0;

  // 🔥 HANDLE BAYAR
  const handlePay = async () => {
    try {
      const amount = parseNumber(payAmount);

      if (!amount) return Swal.fire("Error", "Isi nominal", "warning");

      if (!proof) return Swal.fire("Error", "Upload bukti", "warning");

      if (amount > loan.remaining_amount)
        return Swal.fire("Error", "Melebihi sisa", "warning");

      const confirm = await Swal.fire({
        title: "Konfirmasi Pembayaran",
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

      // 🔥 RESET
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
        <div className="animate-pulse h-10 bg-gray-200 rounded" />
      </Layout>
    );
  }

  if (!loan) return <Layout>Data tidak ditemukan</Layout>;

  return (
    <Layout>
      {/* HEADER */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/loans")}
          className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Kembali
        </button>

        <div>
          <h1 className="text-2xl font-semibold">Loan Detail</h1>
          <p className="text-gray-500 text-sm">
            {loan.Employee?.name} ({loan.Employee?.position})
          </p>
        </div>
      </div>

      {/* CARD */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Info label="Total" value={formatRupiah(loan.total_amount)} />
          <Info
            label="Sisa"
            value={formatRupiah(loan.remaining_amount)}
            className="text-red-500"
          />
          <Info label="Cicilan" value={formatRupiah(loan.installment)} />
        </div>

        {/* PROGRESS */}
        <div>
          <div className="w-full bg-gray-200 h-3 rounded-full">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs mt-1 text-gray-500">
            {progress.toFixed(0)}% selesai
          </p>
        </div>

        {/* BREAKDOWN */}
        <div className="bg-gray-50 p-3 rounded-xl text-sm">
          <p>
            Pokok: <b>{formatRupiah(loan.principal_amount)}</b>
          </p>
          <p>
            Bunga ({loan.interest_rate}%):{" "}
            <b>{formatRupiah(loan.interest_amount)}</b>
          </p>
        </div>
      </div>

      {/* BAYAR */}
      {!isLunas && (
        <div className="bg-white p-6 rounded-2xl shadow mb-6 space-y-3">
          <h2 className="font-semibold">Bayar Cicilan</h2>

          <div className="flex gap-2">
            <input
              value={payAmount}
              onChange={(e) => {
                const raw = parseNumber(e.target.value);
                setPayAmount(raw ? raw.toLocaleString("id-ID") : "");
              }}
              className="border px-4 py-2 rounded-xl w-full"
              placeholder="0"
            />

            <button
              onClick={() =>
                setPayAmount(loan.installment.toLocaleString("id-ID"))
              }
              className="bg-gray-200 px-3 rounded-lg"
            >
              Cicilan
            </button>

            <button
              onClick={() =>
                setPayAmount(loan.remaining_amount.toLocaleString("id-ID"))
              }
              className="bg-green-500 text-white px-3 rounded-lg"
            >
              Lunas
            </button>

            <button
              onClick={handlePay}
              className="bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600"
            >
              Bayar
            </button>
          </div>

          <p className="text-xs text-gray-400">
            Bayar penuh untuk melunasi pinjaman
          </p>

          {/* UPLOAD */}
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
              className="w-32 rounded-lg cursor-pointer hover:scale-105 transition"
              onClick={() => Swal.fire({ imageUrl: preview })}
            />
          )}
        </div>
      )}

      {/* HISTORY */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Sisa</th>
              <th className="p-4">Bukti</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((trx) => (
              <tr key={trx.id} className="border-t">
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
                      className="w-10 cursor-pointer"
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
      </div>
    </Layout>
  );
}

function Info({ label, value, className = "" }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-bold ${className}`}>{value}</p>
    </div>
  );
}
