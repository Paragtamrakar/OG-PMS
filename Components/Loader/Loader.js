"use client";
import React from "react";

// ─────────────────────────────────────────────
//  OG-PMS  — Premium Loader Component
//  Usage:
//    <Loader />                      → full-screen (default)
//    <Loader variant="inline" />     → small inline spinner
//    <Loader variant="section" />    → section-level loader
//    <Loader message="Custom text" /> → override default message
// ─────────────────────────────────────────────

const keyframes = `
  @keyframes og-spin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes og-pulse-ring {
    0%   { transform: scale(0.85); opacity: 0.6; }
    50%  { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(0.85); opacity: 0.6; }
  }
  @keyframes og-bar {
    0%, 100% { transform: scaleY(0.4); opacity: 0.4; }
    50%       { transform: scaleY(1);   opacity: 1;   }
  }
  @keyframes og-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes og-fade-up {
    0%   { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0);   }
  }
  @keyframes og-dot {
    0%, 100% { transform: scale(0.5); opacity: 0.3; }
    50%       { transform: scale(1);   opacity: 1;   }
  }
`;

function injectStyles() {
  if (typeof document !== "undefined" && !document.getElementById("og-loader-styles")) {
    const style = document.createElement("style");
    style.id = "og-loader-styles";
    style.textContent = keyframes;
    document.head.appendChild(style);
  }
}

// ─── Full Screen Loader ───────────────────────
function FullScreenLoader({ message = "Loading..." }) {
  injectStyles();
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 60%, #ecfdf5 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "0",
    }}>

      {/* Ambient glow blob */}
      <div style={{
        position: "absolute", width: 380, height: 380,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Logo mark + rings */}
      <div style={{ position: "relative", width: 96, height: 96, marginBottom: 36 }}>

        {/* Outer slow ring */}
        <div style={{
          position: "absolute", inset: -12,
          borderRadius: "50%",
          border: "1.5px solid rgba(16,185,129,0.15)",
          animation: "og-spin 8s linear infinite",
        }}>
          <div style={{
            position: "absolute", top: "10%", left: "50%",
            width: 6, height: 6, borderRadius: "50%",
            background: "#10b981", transform: "translateX(-50%)",
          }} />
        </div>

        {/* Mid ring */}
        <div style={{
          position: "absolute", inset: -4,
          borderRadius: "50%",
          border: "1.5px dashed rgba(16,185,129,0.2)",
          animation: "og-spin 12s linear infinite reverse",
        }} />

        {/* Pulse ring */}
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          border: "2px solid rgba(16,185,129,0.25)",
          animation: "og-pulse-ring 2.4s ease-in-out infinite",
        }} />

        {/* Core circle */}
        <div style={{
          width: 96, height: 96, borderRadius: "50%",
          background: "linear-gradient(145deg, #059669, #10b981)",
          boxShadow: "0 8px 32px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: "'Georgia', serif",
            fontWeight: 700, fontSize: 26, color: "#fff",
            letterSpacing: "0.05em", userSelect: "none",
          }}>OG</span>
        </div>
      </div>

      {/* Waveform bars */}
      <div style={{
        display: "flex", alignItems: "center", gap: 5,
        height: 28, marginBottom: 24,
      }}>
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{
            width: 3.5, height: "100%", borderRadius: 999,
            background: i === 3
              ? "#059669"
              : i === 2 || i === 4
              ? "#10b981"
              : "rgba(16,185,129,0.4)",
            animation: `og-bar ${0.9 + i * 0.07}s ease-in-out infinite`,
            animationDelay: `${i * 0.11}s`,
          }} />
        ))}
      </div>

      {/* Message */}
      <p style={{
        fontFamily: "'Georgia', serif",
        fontSize: 14, fontWeight: 400,
        color: "#475569", letterSpacing: "0.12em",
        textTransform: "uppercase",
        animation: "og-fade-up 0.6s ease both",
        marginBottom: 6,
      }}>
        {message}
      </p>

      {/* Sub text */}
      <p style={{
        fontSize: 11, color: "#94a3b8",
        letterSpacing: "0.08em", fontFamily: "monospace",
        animation: "og-fade-up 0.8s ease both",
      }}>
        OG-PMS · Hotel Management System
      </p>

      {/* Shimmer progress line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 3,
        background: "linear-gradient(90deg, transparent, #10b981, #34d399, #10b981, transparent)",
        backgroundSize: "200% 100%",
        animation: "og-shimmer 1.8s linear infinite",
      }} />
    </div>
  );
}

// ─── Section Loader ───────────────────────────
function SectionLoader({ message = "Please wait..." }) {
  injectStyles();
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "64px 24px", gap: 20,
      background: "linear-gradient(135deg, #f8fafc, #f0fdf4)",
      borderRadius: 16,
    }}>

      {/* Spinning arc */}
      <div style={{ position: "relative", width: 56, height: 56 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "3px solid #e2e8f0",
        }} />
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "3px solid transparent",
          borderTopColor: "#059669",
          borderRightColor: "#10b981",
          animation: "og-spin 0.9s cubic-bezier(0.4,0,0.2,1) infinite",
        }} />
        <div style={{
          position: "absolute", inset: 8, borderRadius: "50%",
          background: "#f0fdf4",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: "#10b981",
            animation: "og-pulse-ring 1.5s ease-in-out infinite",
          }} />
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{
          fontFamily: "'Georgia', serif",
          fontSize: 15, color: "#334155", fontWeight: 500,
          marginBottom: 4,
        }}>{message}</p>
        <p style={{ fontSize: 12, color: "#94a3b8", letterSpacing: "0.05em" }}>
          OG-PMS
        </p>
      </div>

      {/* 3 dot trail */}
      <div style={{ display: "flex", gap: 7 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#10b981",
            animation: `og-dot 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Inline Spinner ───────────────────────────
function InlineLoader({ size = 20 }) {
  injectStyles();
  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      justifyContent: "center", width: size, height: size,
      position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        border: `2px solid rgba(16,185,129,0.2)`,
      }} />
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        border: `2px solid transparent`,
        borderTopColor: "#059669",
        animation: "og-spin 0.7s linear infinite",
      }} />
    </div>
  );
}

// ─── Main Export ──────────────────────────────
export default function Loader({ variant = "fullscreen", message, size }) {
  if (variant === "inline")  return <InlineLoader size={size} />;
  if (variant === "section") return <SectionLoader message={message} />;
  return <FullScreenLoader message={message} />;
}

// Named exports for convenience
export { FullScreenLoader, SectionLoader, InlineLoader };