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
        /* --- A4 PRINT OPTIMIZATION CSS --- */
        .a4-wrapper {
          width: 210mm;
         min-height: 297mm;
          margin: 0 auto;
          padding: 10mm; 
            box-sizing: border-box;
          background: #ffffff;
          color: #000000;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1); /* Screen shadow */
        }

        .bill-header {
          text-align: center;
          margin-bottom: 25px;
          border-bottom: 2px solid #222;
          padding-bottom: 15px;
        }

        .bill-header h1 {
          margin: 0 0 5px 0;
          font-size: 24px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .bill-header p {
          margin: 2px 0;
          font-size: 14px;
          color: #444;
        }

        .invoice-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .info-grid {
          display: flex;
          justify-content: space-between;
          background: #f9f9f9;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 25px;
          font-size: 14px;
        }

        .info-col p {
          margin: 6px 0;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          font-size: 14px;
        }

        .data-table th, .data-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }

        .data-table th {
          background-color: #f2f2f2;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
        }

        .text-right {
          text-align: right !important;
        }

        .totals-section {
          width: 300px;
          float: right;
          font-size: 15px;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }

        .grand-total {
          font-size: 18px;
          font-weight: bold;
          border-bottom: 2px solid #222;
          border-top: 2px solid #222;
          padding: 12px 0;
          margin-top: 5px;
        }

        .clearfix::after {
          content: "";
          clear: both;
          display: table;
        }

        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }

        /* --- PRINT MEDIA QUERIES --- */
        @media print {
          @page {
            size: A4;
            margin: 0; /* Let the container padding handle margins to prevent blank pages */
          }
          
          body {
            margin: 0;
            padding: 0;
            background: #fff;
          }

          /* Hide everything outside the bill */
         body > *:not(.a4-wrapper || .print-area) {
  display: none !important;
}

          .a4-wrapper, .a4-wrapper * {
            visibility: visible;
          }

          .a4-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;

  height: auto;
  min-height: auto;

  padding: 10mm; /* 🚨 MOST IMPORTANT FIX */

  box-sizing: border-box;
  box-shadow: none;

  overflow: hidden;
}

          /* Prevent rows from splitting across pages if data is long */
          tr {
            
            page-break-after: auto;
          }
        }
      `}</style>

            <div className="a4-wrapper">
                {/* HEADER */}
                <div className="bill-header">
                    <h1>OG-PMS </h1>
                    <p>Main Road Beohari, Madhya Pradesh</p>
                    <p>GSTIN: 23AZPPK0181Q1ZW</p>
                    <p>Phone: +91 99999 00000 | Email: info@palace.com</p>
                </div>

                {/* INVOICE META */}
                <div className="invoice-meta">
                    <div><strong>Invoice No:</strong> {invoiceNo}</div>
                    <div><strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}</div>
                </div>

                {/* GUEST & STAY INFO */}
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

                {/* DAILY BREAKDOWN TABLE */}
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
                                <td> Room Service</td>
                                <td className="text-right">{foodTotal.toFixed(2)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* CHARGES & TOTALS */}
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

                {/* FOOTER */}
                <div className="footer">
                    <div>www.beohari.com</div>
                    <div style={{ marginTop: "5px" }}>
                        — Software by The OG Developers —
                    </div>
                </div>
            </div>
        </>
    );
}