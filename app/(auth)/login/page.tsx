"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn, Building2, AlertCircle } from "lucide-react";

// Komponen terpisah yang pakai useSearchParams — wajib dibungkus Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");

    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Username atau password salah.");
        return;
      }

      // Simpan user info ke localStorage (cookie sudah di-set oleh route handler)
      localStorage.setItem("user_id", String(data.data.user.id));
      localStorage.setItem("username", data.data.user.username);

      router.replace(redirect);
    } catch {
      setError("Gagal terhubung ke server. Coba beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-md border border-gray-200">
        {/* Banner atas */}
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
        <div className="flex-1 bg-white flex flex-col justify-center p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Selamat datang
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Masuk untuk melanjutkan ke sistem inventaris
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4 text-sm text-red-700">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Masukkan username"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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

          <div className="flex items-center justify-between mb-5">
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-blue-600"
              />
              Ingat saya
            </label>
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline"
            >
              Lupa password?
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0C2D6B] hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            <LogIn size={16} />
            {isLoading ? "Memproses..." : "Masuk"}
          </button>

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

// Suspense diperlukan karena LoginForm memakai useSearchParams()
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
