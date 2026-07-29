"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/api/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setErrorMsg(errorParam);
      setSuccessMsg(null);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await authService.login(email, password);
      
      if (response.user) {
        if (response.user.role !== 'ADMIN' && response.user.role !== 'MODERATOR') {
          setErrorMsg("Unauthorized. Admin or Moderator privileges required.");
          await authService.logout();
          setLoading(false);
          return;
        }

        setSuccessMsg("Login successful! Redirecting...");
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-zinc-800">
      
      {/* Left Side - Visual / Branding */}
      <div className="hidden md:flex md:w-1/2 relative bg-indigo-600 p-12 flex-col justify-between overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">SafeVoice</h1>
          <p className="mt-2 text-indigo-200">Admin Control Center</p>
        </div>
        
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium text-white">
              "Empowering communities through safe, moderated, and engaging discussions."
            </p>
            <footer className="text-sm text-indigo-200">SafeVoice Platform</footer>
          </blockquote>
        </div>
        
        {/* Decorative background circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-semibold text-white tracking-tight">Welcome back</h2>
            <p className="text-sm text-zinc-400 mt-2">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border-0 py-2.5 px-4 bg-zinc-800 text-white shadow-sm ring-1 ring-inset ring-zinc-700 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 transition-all duration-200"
                placeholder="admin@safevoice.app"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border-0 py-2.5 px-4 bg-zinc-800 text-white shadow-sm ring-1 ring-inset ring-zinc-700 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            {/* Status Messages */}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-sm text-red-400 text-center font-medium">{errorMsg}</p>
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-3">
                <p className="text-sm text-emerald-400 text-center font-medium">{successMsg}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Sign in to Dashboard"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Suspense fallback={
        <div className="w-full max-w-5xl bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-zinc-800 p-12 justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
