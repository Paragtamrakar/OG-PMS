"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

// ================= CONTEXT =================
const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
};

// ================= ICONS =================
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9l-6 6M9 9l6 6" />
  </svg>
);

const CardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

// ================= TOAST COMPONENT =================
export function Toast({ type, title, subtitle }) {
  const [visible, setVisible] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const frame = requestAnimationFrame(() => {
      if (mountedRef.current) setVisible(true);
    });

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(frame);
    };
  }, []);

  const base =
    "min-w-[260px] max-w-sm rounded-xl px-4 py-3 shadow-md border transition-all duration-200 ease-out transform bg-white";

  const variants = {
    checkin: "border-emerald-200 text-slate-800",
    checkout: "bg-slate-900 border-slate-700 text-white",
    error: "border-rose-200 text-slate-800",
  };

  const icons = {
    checkin: <div className="text-emerald-600"><CheckIcon /></div>,
    checkout: <div className="text-white"><CardIcon /></div>,
    error: <div className="text-rose-600"><ErrorIcon /></div>,
  };

  return (
    <div
      className={`${base} ${variants[type] || variants.checkin} ${
        visible
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-12 opacity-0 scale-95"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icons[type] || icons.checkin}</div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">{title}</span>
          {subtitle && (
            <span className="text-xs opacity-70 mt-0.5">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ================= PROVIDER =================
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "checkin", title = "", subtitle = "" }) => {
      if (!title) {
        console.warn("Toast requires a title");
        return;
      }

      const id = Date.now() + Math.random();

      const newToast = { id, type, title, subtitle };

      setToasts((prev) => [newToast, ...prev]);

      setTimeout(() => {
        removeToast(id);
      }, 3000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ================= TEST CASES =================
/*
// 1. BASIC CHECK-IN
showToast({ type: "checkin", title: "Room 101 Checked In", subtitle: "Rahul Sharma • 2 Nights" });

// 2. CHECKOUT
showToast({ type: "checkout", title: "Room 101 Checked Out", subtitle: "Rahul Sharma • ₹2400" });

// 3. ERROR
showToast({ type: "error", title: "Checkout Failed", subtitle: "Try again" });

// 4. STACK TEST
showToast({ type: "checkin", title: "Room 102 Checked In" });
showToast({ type: "checkout", title: "Room 103 Checked Out" });

// 5. EDGE CASE
showToast({ type: "checkin" });
*/

// ================= USAGE =================
/*
import { ToastProvider, useToast } from "./ToastProvider";

function App() {
  return (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  );
}

function Demo() {
  const { showToast } = useToast();

  return (
    <button
      onClick={() =>
        showToast({
          type: "checkin",
          title: "Room 101 Checked In",
          subtitle: "Rahul Sharma • 2 Nights",
        })
      }
    >
      Test Toast
    </button>
  );
}
*/
