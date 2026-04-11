/**
 * useTables (System ka brain 🧠)
 * ------------------------------
 * Yeh pura restaurant system control karta hai.
 * 
 * Kya handle karta hai:
 * - Kaun sa table free hai ya occupied
 * - Har table ka order (items, customer, etc.)
 * - Item add/remove/update
 * - Table reset (bill ke baad)
 * - Timer kab start hoga
 * 
 * Important cheeze:
 * - Har table ka apna alag order hota hai
 * - Data localStorage me save hota hai (refresh ke baad bhi safe)
 * - DB me sirf final bill save hota hai
 * 
 * Functions:
 * - addItem → item add
 * - updateQuantity → quantity change
 * - removeItem → item delete
 * - updateOrder → customer/discount change
 * - resetTable → table clear
 * - computeTotals → total calculate
 * 
 * Simple samajh:
 * → Yeh pura system ka “engine” hai
 */

"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { TABLES } from "@/data/Tables";

const STORAGE_KEY = "ogpms_tablesState";

/** Build the default runtime shape for a single table */
const defaultTableState = (table) => ({
  id: table.id,
  name: table.name,
  capacity: table.capacity,
  zone: table.zone,
  status: "available",       // "available" | "occupied"
  startedAt: null,           // ISO string — set when first item added
  order: {
    items: [],
    customer: { name: "", phone: "" },
    discount: 0,
    gstPercent: 5,
  },
});

/** Hydrate state from localStorage — merge with current TABLES config */
const hydrate = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // Re-merge with TABLES so new tables added to config appear
    return TABLES.map((t) => {
      const existing = saved.find((s) => s.id === t.id);
      return existing
        ? { ...defaultTableState(t), ...existing, name: t.name, capacity: t.capacity, zone: t.zone }
        : defaultTableState(t);
    });
  } catch {
    return null;
  }
};

export function useTables() {
  const [tablesState, setTablesState] = useState(() => {
    // SSR-safe: only run in browser
    if (typeof window === "undefined") return TABLES.map(defaultTableState);
    return hydrate() || TABLES.map(defaultTableState);
  });

  const [activeTableId, setActiveTableId] = useState(null);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tablesState));
    } catch {}
  }, [tablesState]);

  // ─── Table Selectors ────────────────────────────────────────────────────────

  const activeTable = useMemo(
    () => tablesState.find((t) => t.id === activeTableId) || null,
    [tablesState, activeTableId]
  );

  // ─── Order Mutators ─────────────────────────────────────────────────────────

  /** Update a specific table's state (immutably) */
  const updateTable = useCallback((id, patch) => {
    setTablesState((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  }, []);

  /** Update order fields for a specific table */
  const updateOrder = useCallback((id, orderPatch) => {
    setTablesState((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, order: { ...t.order, ...orderPatch } }
          : t
      )
    );
  }, []);

  /** Add an item to a table's order */
  const addItem = useCallback((tableId, food) => {
    setTablesState((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const items = t.order.items;
        const existing = items.find((i) => i.id === food.id);
        const newItems = existing
          ? items.map((i) => i.id === food.id ? { ...i, quantity: i.quantity + 1 } : i)
          : [...items, { ...food, quantity: 1 }];

        const isFirstItem = items.length === 0;
        return {
          ...t,
          status: "occupied",
          startedAt: isFirstItem ? new Date().toISOString() : t.startedAt,
          order: { ...t.order, items: newItems },
        };
      })
    );
  }, []);

  /** Update item quantity (delta: +1 or -1) */
  const updateQuantity = useCallback((tableId, itemId, delta) => {
    setTablesState((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const newItems = t.order.items
          .map((i) =>
            i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
          )
          .filter((i) => i.quantity > 0);
        const isEmpty = newItems.length === 0;
        return {
          ...t,
          status: isEmpty ? "available" : "occupied",
          startedAt: isEmpty ? null : t.startedAt,
          order: { ...t.order, items: newItems },
        };
      })
    );
  }, []);

  /** Remove an item entirely */
  const removeItem = useCallback((tableId, itemId) => {
    setTablesState((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const newItems = t.order.items.filter((i) => i.id !== itemId);
        const isEmpty = newItems.length === 0;
        return {
          ...t,
          status: isEmpty ? "available" : "occupied",
          startedAt: isEmpty ? null : t.startedAt,
          order: { ...t.order, items: newItems },
        };
      })
    );
  }, []);

  /** Reset a table to clean state after billing */
  const resetTable = useCallback((tableId) => {
    const meta = TABLES.find((t) => t.id === tableId);
    if (!meta) return;
    setTablesState((prev) =>
      prev.map((t) => (t.id === tableId ? defaultTableState(meta) : t))
    );
  }, []);

  // ─── Totals Calculator (same logic as original, per-table) ──────────────────

  const computeTotals = useCallback((order) => {
    const { items = [], discount = 0, gstPercent = 5 } = order;
    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const afterDiscount = Math.max(0, subtotal - (Number(discount) || 0));
    const gstAmount = (afterDiscount * (Number(gstPercent) || 0)) / 100;
    const preciseTotal = afterDiscount + gstAmount;
    const finalAmount = Math.round(preciseTotal);
    const roundOff = (finalAmount - preciseTotal).toFixed(2);
    return { subtotal, afterDiscount, gstAmount, roundOff, finalAmount };
  }, []);

  return {
    tablesState,
    activeTableId,
    setActiveTableId,
    activeTable,
    addItem,
    updateQuantity,
    removeItem,
    updateOrder,
    resetTable,
    computeTotals,
  };
}