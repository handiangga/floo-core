import { useEffect, useState } from "react";
import Layout from "../../components/layout/LayoutTest";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/api";
import { formatNumber } from "../../utils/format";
import { UploadCloud } from "lucide-react";
import { uploadToSupabase } from "../../utils/uploadSupabase";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    position: "",
    salary: "",
    salary_type: "",
    phone: "",
    address: "",
  });

  const [salaryDisplay, setSalaryDisplay] = useState("");

  const [photo, setPhoto] = useState(null);
  const [ktp, setKtp] = useState(null);

  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [previewKtp, setPreviewKtp] = useState(null);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSalary = (val) => {
    const raw = val.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, salary: raw }));
    setSalaryDisplay(raw ? formatNumber(raw) : "");
  };

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      const data = res?.data?.data;

      setForm({
        name: data.name || "",
        position: data.position || "",
        salary: data.salary || "",
        salary_type: data.salary_type || "",
        phone: data.phone || "",
        address: data.address || "",
      });

      setSalaryDisplay(data.salary ? formatNumber(data.salary) : "");

      setPreviewPhoto(data.photo || null);
      setPreviewKtp(data.ktp_photo || null);
    } catch (err) {
      Swal.fire("Error", "Gagal ambil data", "error");
      navigate("/employees");
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.position || !form.salary || !form.salary_type) {
      return Swal.fire("Error", "Data wajib belum lengkap", "warning");
    }

    const confirm = await Swal.fire({
      title: "Yakin update?",
      text: "Pastikan data sudah benar",
      icon: "question",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);

      let photoUrl = previewPhoto;
      let ktpUrl = previewKtp;

      if (photo) {
        photoUrl = await uploadToSupabase(photo);
      }

      if (ktp) {
        ktpUrl = await uploadToSupabase(ktp);
      }

      await api.put(`/employees/${id}`, {
        ...form,
        photo: photoUrl,
        ktp_photo: ktpUrl,
      });

      Swal.fire("Berhasil", "Data berhasil diupdate", "success");
      navigate("/employees");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || err.message || "Gagal update",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8 flex items-center gap-3">
        <button
          onClick={() => navigate("/employees")}
          className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200"
        >
          ← Kembali
        </button>

        <h1 className="text-2xl font-bold text-gray-800">Edit Employee</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <UploadCard
              label="Foto Profil"
              preview={previewPhoto}
              onChange={(file) => {
                setPhoto(file);
                setPreviewPhoto(URL.createObjectURL(file));
              }}
            />

            <UploadCard
              label="Foto KTP"
              preview={previewKtp}
              large
              onChange={(file) => {
                setKtp(file);
                setPreviewKtp(URL.createObjectURL(file));
              }}
            />
          </div>

          <Input
            label="Nama"
            value={form.name}
            onChange={(v) => handleChange("name", v)}
          />

          <Select
            label="Posisi"
            value={form.position}
            onChange={(v) => handleChange("position", v)}
            options={[
              { label: "Staff", value: "staff" },
              { label: "Penjahit", value: "penjahit" },
            ]}
          />

          <div>
            <label className="text-sm text-gray-600">Gaji</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-2.5 text-gray-400">Rp</span>

              <input
                value={salaryDisplay}
                onChange={(e) => handleSalary(e.target.value)}
                className="w-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 pl-10 pr-4 py-2.5 rounded-xl"
              />
            </div>
          </div>

          <Select
            label="Tipe Gaji"
            value={form.salary_type}
            onChange={(v) => handleChange("salary_type", v)}
            options={[
              { label: "Bulanan", value: "monthly" },
              { label: "Mingguan", value: "weekly" },
            ]}
          />

          <Input
            label="Phone"
            value={form.phone}
            onChange={(v) => handleChange("phone", v)}
          />

          <Input
            label="Alamat"
            value={form.address}
            onChange={(v) => handleChange("address", v)}
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/employees")}
              className="px-5 py-2 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              Batal
            </button>

            <button
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm"
            >
              {loading ? "Menyimpan..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

/* COMPONENT */

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        className="w-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 py-2.5 rounded-xl mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select
        className="w-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 py-2.5 rounded-xl mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Pilih</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function UploadCard({ label, preview, onChange, large }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>

      <label className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-400 transition">
        {preview ? (
          <img
            src={preview}
            className={`rounded-xl object-cover ${
              large ? "w-40 h-40" : "w-24 h-24"
            }`}
          />
        ) : (
          <>
            <UploadCloud className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-400">Upload gambar</p>
          </>
        )}

        <input
          type="file"
          hidden
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            onChange(file);
          }}
        />
      </label>
    </div>
  );
}
