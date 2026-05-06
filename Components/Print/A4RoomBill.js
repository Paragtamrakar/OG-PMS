import React from "react";

// ==========================================
// HELPER FUNCTIONS (Safe Data Handling)
// ==========================================


const safeDate = (val) => {
  if (!val) return null;

  // Handle MongoDB Date Objects
  if (typeof val === "object" && val.$date) {
    return new Date(val.$date);
  }

  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Formats dates securely, falling back to a placeholder if invalid
 */
const formatDateTime = (date) => {
  const d = safeDate(date);
  if (!d) return "-";

  return d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

/**
 * Calculates nights between two dates. Enforces a minimum of 1 night.
 */
const getNights = (checkIn, checkOut) => {
  const inDate = safeDate(checkIn);
  const outDate = safeDate(checkOut) || new Date(); // Fallback to current time if no checkout

  if (!inDate) return 1;

  const diff = outDate.getTime() - inDate.getTime();
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return nights > 0 ? nights : 1;
};

/**
 * Generates the daily breakdown array safely
 */
const generateDailyBreakdown = (checkIn, nights, price) => {
  const arr = [];
  const startDate = safeDate(checkIn) || new Date();
  const safePrice = Number(price) || 0;

  for (let i = 0; i < nights; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);

    arr.push({
      date: d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      day: i + 1,
      amount: safePrice,
    });
  }

  return arr;
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function A4RoomBill({ booking }) {
  // 1. SAFEGUARD: Return empty structure if booking is completely missing
  if (!booking) {
    return <div className="p-4 text-red-500">Error: No booking data provided.</div>;
  }

  // 2. DATA NORMALIZATION: Handle both nested and flat structures safely
  const rawId = booking?.bookingId || booking?._id || "0000";
  const invoiceNo = booking.invoiceNumber || "AV-XXXX";

  const guestName = booking?.guest?.name || booking?.guestName || "Guest";
  const guestCity =
    booking?.guest?.fromCity ||
    booking?.fromCity ||
    booking?.guestCity ||
    "-";

  const roomNo = booking?.roomSnapshot?.roomNo || booking?.roomNo || "-";
  const rawPrice = booking?.roomSnapshot?.pricePerNight || booking?.roomPrice || booking?.price || 0;
  const pricePerNight = Number(rawPrice) || 0;

  const checkIn = booking?.checkIn?.$date || booking?.checkIn || null;
  const checkOut = booking?.checkOut?.$date || booking?.checkOut || null;

  // const foodOrders = Array.isArray(booking?.foodOrders) ? booking.foodOrders : []; 

  // 3. CALCULATIONS
  const nights = getNights(checkIn, checkOut);
  const dailyBreakdown = generateDailyBreakdown(checkIn, nights, pricePerNight);

  const roomTotal = nights * pricePerNight;
  // const foodTotal = foodOrders.reduce((sum, item) => sum + (Number(item?.total) || 0), 0); 
  const foodTotal = Number(booking?.foodTotal) || 0;
  const gst = Number(booking?.gstAmount) || 0;
  const grandTotal = Number(booking?.grandTotal) || (roomTotal + foodTotal + gst);

  return (
    <>
      <style>{`

        /* =============================================
           SCREEN STYLES — only visuals changed
           ============================================= */

        .a4-wrapper {
          width: 210mm;
        height: auto;
          // min-height: 297mm;
          margin: 0 auto;
          padding: 10mm;
          box-sizing: border-box;
          background: #ffffff;
          color: #000000;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }

        .av-bar-top {
          height: 5px;
          background: #1c3557;
          margin: -10mm -10mm 18px -10mm;
        }
        .av-bar-gold {
          height: 3px;
          background: #c9a84c;
          margin: 0 -10mm 16px -10mm;
        }
        .av-bar-bottom {
          height: 4px;
          background: #c9a84c;
          margin: 16px -10mm -10mm -10mm;
        }

        .bill-header {
          text-align: center;
          margin-bottom: 0;
          padding-bottom: 14px;
          border-bottom: none;
        }
        .bill-header h1 {
          margin: 0 0 3px 0;
          font-size: 24px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #1c3557;
        }
        .av-tagline {
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #c9a84c;
          margin-bottom: 8px;
        }
        .bill-header p {
          margin: 2px 0;
          font-size: 11px;
          color: #555;
        }

        .invoice-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          font-size: 12px;
          background: #f5f3ef;
          padding: 8px 12px;
          border-left: 3px solid #1c3557;
          color: #444;
        }
        .invoice-meta strong { color: #1c3557; }
        .av-inv-type {
          font-size: 13px;
          font-weight: 700;
          color: #1c3557;
          letter-spacing: 0.5px;
        }

        .info-grid {
          display: flex;
          justify-content: space-between;
          background: #f9f8f5;
          padding: 12px 14px;
          border: 1px solid #e2ddd5;
          border-top: 2px solid #1c3557;
          border-radius: 0 0 4px 4px;
          margin-bottom: 18px;
          font-size: 12px;
        }
        .info-col p {
          margin: 5px 0;
          color: #333;
        }
        .info-col p strong {
          color: #1c3557;
          font-weight: 600;
          display: inline-block;
          min-width: 95px;
        }

        .av-section-label {
          font-size: 8px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #c9a84c;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 12px;
        }
        .data-table th {
          background: #1c3557;
          color: #ffffff;
          font-weight: 600;
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 9px 10px;
          text-align: left;
          border: none;
        }
        .data-table td {
          border: none;
          border-bottom: 1px solid #eeebe5;
          padding: 8px 10px;
          text-align: left;
          color: #333;
        }
        .data-table tbody tr:nth-child(even) td {
          background: #faf9f6;
        }
        .data-table tbody tr:last-child td {
          border-bottom: 2px solid #c9a84c;
        }
        .text-right { text-align: right !important; }
        .data-table td.text-right {
          font-weight: 600;
          color: #1a1a1a;
        }

        .totals-section {
          width: 300px;
          float: right;
          font-size: 13px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 7px 0;
          border-bottom: 1px solid #eeebe5;
          color: #555;
        }
        .totals-row span:last-child {
          font-weight: 600;
          color: #111;
        }
        .grand-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1c3557;
          color: #ffffff;
          padding: 11px 14px;
          margin-top: 8px;
          border-radius: 3px;
          font-size: 15px;
          font-weight: 700;
          border-bottom: none;
          border-top: none;
        }
        .grand-total span:last-child {
          color: #c9a84c;
          font-size: 17px;
        }

        .clearfix::after {
          content: "";
          clear: both;
          display: table;
        }

        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 10px;
          color: #888;
          border-top: 1px solid #e2ddd5;
          padding-top: 12px;
        }
        .footer div:first-child {
          font-size: 12px;
          color: #555;
          font-style: italic;
          margin-bottom: 4px;
        }

        /* =============================================
           PRINT MEDIA QUERIES — 100% UNCHANGED
           ============================================= */
       @media print {
  @page {
    size: A4;
    margin: 0;
  }

  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }

  /* Hide whole dashboard + modal */
  main {
    display: none !important;
  }

  /* show only portal bill */
  #print-root {
    display: block !important;
    position: fixed;
    inset: 0;
    width: 100%;
    background: white;
  }

  .a4-wrapper {
    width: 100%;
    height: auto;
    min-height: auto;
    padding: 10mm;
    margin: 0;
    box-shadow: none;
    overflow: visible;
  }

  tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
      `}</style>

      <div className="a4-wrapper">

        {/* Top navy bar */}
        <div className="av-bar-top"></div>

        {/* HEADER */}
        <div className="bill-header">
          <h1>OG-PMS</h1>
          <div className="av-tagline">Property Management System</div>
          <p>Main Road Beohari, Madhya Pradesh</p>
          <p>GSTIN: 23AZPPK0181Q1ZW &nbsp;|&nbsp; Phone: +91 99999 00000 &nbsp;|&nbsp; Email: info@palace.com</p>
        </div>

        {/* Gold divider */}
        <div className="av-bar-gold"></div>

        {/* INVOICE META — UNCHANGED logic */}
        <div className="invoice-meta">
          <span className="av-inv-type">Tax Invoice</span>
          <span><strong>Invoice No:</strong> {invoiceNo}</span>
          <span><strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}</span>
        </div>

        {/* GUEST & STAY INFO — UNCHANGED */}
        <div className="info-grid">
          <div className="info-col">
            <p><strong>Guest Name:</strong> {guestName}</p>
            <p><strong>From City:</strong> {guestCity}</p>
            <p><strong>Room No:</strong> {roomNo}</p>
          </div>
          <div className="info-col">
            <p><strong>Check-in:</strong> {formatDateTime(checkIn)}</p>
            <p><strong>Check-out:</strong> {formatDateTime(checkOut)}</p>
            <p><strong>Total Nights:</strong> {nights}</p>
          </div>
        </div>

        {/* Section label */}
        <div className="av-section-label">Charge Breakdown</div>

        {/* DAILY BREAKDOWN TABLE — UNCHANGED */}
        <table className="data-table">
          <thead>
            <tr>
              <th width="10%">Day</th>
              <th width="40%">Date</th>
              <th width="30%">Description</th>
              <th width="20%" className="text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {dailyBreakdown.map((d, i) => (
              <tr key={`day-${i}`}>
                <td>{d.day}</td>
                <td>{d.date}</td>
                <td>Room Charges</td>
                <td className="text-right">{d.amount.toFixed(2)}</td>
              </tr>
            ))}

            {/* Show summarized food row if there are orders */}
            {foodTotal > 0 && (
              <tr>
                <td>-</td>
                <td>Others</td>
                <td>Room Service</td>
                <td className="text-right">{foodTotal.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* CHARGES & TOTALS — UNCHANGED */}
        <div className="clearfix">
          <div className="totals-section">
            <div className="totals-row">
              <span>Room Total:</span>
              <span>₹{roomTotal.toFixed(2)}</span>
            </div>
            <div className="totals-row">
              <span>Food & Services:</span>
              <span>₹{foodTotal.toFixed(2)}</span>
            </div>
            <div className="totals-row">
              <span>GST (5%):</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="totals-row grand-total">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid #000', paddingTop: '5px' }}>
              Authorized Signatory
            </div>
          </div>
        </div>

        {/* FOOTER — UNCHANGED */}
        <div className="footer">
          <div>www.beohari.com</div>
          <div style={{ marginTop: "5px" }}>
            — Software by The OG Developers —
          </div>
        </div>

        {/* Bottom gold bar */}
        <div className="av-bar-bottom"></div>

      </div>
    </>
  );
}