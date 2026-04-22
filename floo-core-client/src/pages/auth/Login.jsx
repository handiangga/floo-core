import { useState } from "react";
import api from "../../api/api";
import { setToken } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);

      setToken(res.data.data.token);

      Swal.fire({
        icon: "success",
        title: "Login Berhasil 🎉",
        text: "Selamat datang kembali!",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/dashboard");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: err?.response?.data?.message || "Cek email & password kamu",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Flo Core</h1>
          <p className="text-white/70 text-sm mt-2">Login ke dashboard kamu</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-white/80 text-sm">Email</label>
            <input
              type="email"
              placeholder="admin@floo.com"
              className="w-full mt-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/40"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-white/80 text-sm">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full mt-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/40"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-white/60 text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-white text-indigo-600 font-semibold hover:bg-opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <p className="text-center text-white/60 text-sm mt-6">
          © {new Date().getFullYear()} Flo Core
        </p>
      </div>
    </div>
  );
}
