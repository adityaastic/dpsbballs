"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useToast } from "@/components/admin/AdminUI";

export default function AdminLoginPage() {
  const { login, user, loading } = useAdminAuth();
  const router = useRouter();
  const { show, ToastContainer } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push("/admin");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      show("Enter username and password", "error");
      return;
    }
    setSubmitting(true);
    const ok = await login(username, password);
    setSubmitting(false);
    if (ok) {
      show("Welcome back!", "success");
      setTimeout(() => router.push("/admin"), 300);
    } else {
      show("Invalid credentials", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-display text-5xl tracking-widest text-white mb-2">
            DSP
          </div>
          <div className="text-slate-400 text-sm">Admin Panel Login</div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-xl p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Username or Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin@12345"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-medium rounded-md transition"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <div>
              <strong>Default login:</strong> admin / Admin@12345
            </div>
            <div>
              Make sure MongoDB is running and then visit{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded">/api/seed</code>{" "}
              first.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
