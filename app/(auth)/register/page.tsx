"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Eye,
  EyeOff,
  UserPlus,
  Building2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister() {
    setError("");
    setSuccess("");

    if (!username || !password || !confirmPassword) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Register gagal.");
        return;
      }

      setSuccess("Register berhasil. Mengarahkan ke login...");

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-md border border-gray-200">
        {/* Banner */}
        <div className="bg-[#0C2D6B] px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <Building2 size={20} className="text-blue-300" />
          </div>

          <div>
            <p className="text-sm font-semibold text-blue-50 leading-snug">
              LPKA Kelas 1 Martapura
            </p>

            <p className="text-xs text-blue-400 mt-0.5">
              Sistem Inventaris Barang · Kemenkumham RI
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Buat akun
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            Daftarkan akun untuk mengakses sistem inventaris
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4 text-sm text-red-700">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 mb-4 text-sm text-green-700">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Username */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="Masukkan username"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Password
            </label>

            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                placeholder="Masukkan password"
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Konfirmasi Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                placeholder="Ulangi password"
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0C2D6B] hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            <UserPlus size={16} />

            {isLoading ? "Memproses..." : "Daftar"}
          </button>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-gray-500">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:underline"
            >
              Masuk
            </button>
          </p>

          <p className="mt-5 text-center text-xs text-gray-400 leading-relaxed">
            Hanya untuk pegawai LPKA Kelas 1 Martapura yang berwenang.
            <br />
            Hubungi admin jika ada masalah akses.
          </p>
        </div>
      </div>
    </main>
  );
}
