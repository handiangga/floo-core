import { useEffect, useState } from "react";
import Layout from "../../components/layout/LayoutTest";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/api";
import { formatRupiah } from "../../utils/format";

export default function DetailEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/employees/${id}`);
      setData(res?.data?.data);
    } catch (err) {
      Swal.fire("Error", "Gagal ambil data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // 🔥 badge
  const getBadge = (pos) => {
    if (pos === "penjahit") return "bg-green-100 text-green-600";
    if (pos === "staff") return "bg-blue-100 text-blue-600";
    return "bg-gray-100 text-gray-600";
  };

  if (loading)
    return (
      <Layout>
        <div className="p-10 text-center text-gray-400">Loading...</div>
      </Layout>
    );

  if (!data)
    return (
      <Layout>
        <div className="p-10 text-center text-gray-400">
          Data tidak ditemukan
        </div>
      </Layout>
    );

  return (
    <Layout>
      {/* HEADER */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/employees")}
          className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Kembali
        </button>

        <h1 className="text-2xl font-bold">Detail Karyawan</h1>
      </div>

      {/* CARD */}
      <div className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FOTO */}
        <div className="flex flex-col items-center">
          <img
            src={data.photo || "/default-avatar.png"}
            onError={(e) => (e.target.src = "/default-avatar.png")}
            className="w-40 h-40 rounded-2xl object-cover border"
          />

          <p className="mt-3 font-semibold text-lg">{data.name}</p>

          <span
            className={`mt-1 px-3 py-1 text-xs rounded-full ${getBadge(
              data.position,
            )}`}
          >
            {data.position || "-"}
          </span>
        </div>

        {/* INFO */}
        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Nama</p>
              <p className="font-medium">{data.name}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Posisi</p>
              <p className="font-medium">{data.position}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Gaji</p>
              <p className="font-medium">
                {formatRupiah(data.salary)}
                <span className="text-xs text-gray-400 ml-2">
                  ({data.salary_type})
                </span>
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">No HP</p>
              <p className="font-medium">{data.phone || "-"}</p>
            </div>

            <div className="col-span-2">
              <p className="text-gray-500 text-sm">Alamat</p>
              <p className="font-medium">{data.address || "-"}</p>
            </div>
          </div>

          {/* KTP */}
          <div>
            <p className="text-gray-500 text-sm mb-2">Foto KTP</p>

            {data.ktp_photo ? (
              <img
                src={data.ktp_photo}
                onError={(e) => (e.target.src = "/default-avatar.png")}
                className="w-64 rounded-xl border cursor-pointer hover:scale-105 transition"
                onClick={() =>
                  Swal.fire({
                    imageUrl: data.ktp_photo,
                    imageWidth: 400,
                    showConfirmButton: false,
                  })
                }
              />
            ) : (
              <p className="text-gray-400 text-sm">Tidak ada foto KTP</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
