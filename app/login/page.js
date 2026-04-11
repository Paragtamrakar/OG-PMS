"use client";
import React, { useState } from "react";
import Loader from "@/Components/Loader/Loader";
export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // PRESERVED LOGIC: Existing handleLogin function
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",   // ⭐ THIS LINE IS REQUIRED
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data); // debug

      if (data.success) {
        // PRESERVED LOGIC: router navigation (mocked for preview)
        console.log("Redirecting to /...");
        window.location.href = "/";
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setLoading(false);
  };
  if (loading) return <Loader message="Signing you in..." />;

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb] font-serif relative overflow-hidden">

      {/* Decorative subtle background elements for hotel feel */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#f5f2ed] rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#efe9e1] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white border border-[#e5e0d8] shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden p-10 md:p-12 transition-all duration-700 ease-in-out transform hover:scale-[1.005]">

          {/* Header */}
          <header className="text-center mb-10">
            <h1 className="text-[#3a3530] text-3xl font-light tracking-[0.25em] uppercase mb-2">
              OG-PMS
            </h1>
            <div className="h-px w-12 bg-[#c5a059] mx-auto mb-4"></div>
            <p className="text-[#8c857d] text-[11px] uppercase tracking-[0.15em] font-sans">
              Billing Management System
            </p>
          </header>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5c564f] mb-2 ml-1 transition-colors group-focus-within:text-[#c5a059]">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#faf9f7] border border-[#e5e0d8] px-4 py-3.5 rounded-lg text-[#3a3530] placeholder-[#b8b0a5] focus:outline-none focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059] transition-all duration-300 font-sans"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5c564f] mb-2 ml-1 transition-colors group-focus-within:text-[#c5a059]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#faf9f7] border border-[#e5e0d8] px-4 py-3.5 rounded-lg text-[#3a3530] placeholder-[#b8b0a5] focus:outline-none focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059] transition-all duration-300 font-sans pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8b0a5] hover:text-[#c5a059] transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-[#3a3530] text-[#fdfcfb] py-4 rounded-lg font-medium tracking-widest uppercase text-[10px] overflow-hidden transition-all duration-500 hover:bg-[#2a2622] disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-xl mt-4"
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader variant="inline" size={16} />
                    Authenticating...
                  </span>
                ) : (
                  "Sign In"
                )}
              </span>
              {/* Subtle gold slide-up effect */}
              <div className="absolute inset-0 bg-[#c5a059] transform translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-[92%]"></div>
            </button>
          </form>

          <footer className="mt-12 text-center">
            <p className="text-[#b8b0a5] text-[9px] uppercase tracking-[0.3em]">
              Authorized Access Only
            </p>
            <div className="flex justify-center space-x-2 mt-5 opacity-40">
              <div className="w-1 h-1 rounded-full bg-[#c5a059]"></div>
              <div className="w-1 h-1 rounded-full bg-[#c5a059]"></div>
              <div className="w-1 h-1 rounded-full bg-[#c5a059]"></div>
            </div>
          </footer>
        </div>

        {/* Help text */}
        <p className="text-center mt-8 text-[#b8b0a5] text-[11px] tracking-wide font-sans">
          Technical Support: ext. 404
        </p>
      </div>
    </div>
  );
}