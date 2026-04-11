export default function RestaurantThermalBill({
  billNo,
  customer,
  items,
  totals,
  discount,
  gstPercent,
  today
}) {
  
  return (
    <>

      {/* ========================= */}
      {/* THERMAL PRINT STYLES */}
      {/* ========================= */}

      <style>{`

/* ===== SCREEN PREVIEW BOX ===== */
.thermal-preview-wrapper {
  display: flex;
  justify-content: center;
  padding: 40px 0;
  background: #f1f5f9;
}

.print-thermal {
  width: 320px;   /* 80mm approx */
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  font-family: "Courier New", monospace;
  font-size: 13px;
  line-height: 1.4;
  color: #000;
}

/* ========================= */
/* PRINT MODE */
/* ========================= */
@media print {

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    width: 80mm;
    background: white;
  }

  body * {
    visibility: hidden;
  }

  .print-thermal,
  .print-thermal * {
    visibility: visible;
  }

  .print-thermal {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm;
    padding: 6mm 4mm;
    border: none;
    box-shadow: none;
  }

  @page {
    size: 80mm auto;
    margin: 0;
  }
}

/* HELPERS */
.pt-center { text-align: center; }
.pt-bold { font-weight: bold; }

.pt-hr {
  border-bottom: 1px dashed #000;
  margin: 6px 0;
}

.pt-db-hr {
  border-bottom: 2px double #000;
  margin: 8px 0;
}

`}</style>


      {/* ========================= */}
      {/* THERMAL RECEIPT STRUCTURE */}
      {/* ========================= */}

      <div className="thermal-preview-wrapper">

        <div className="print-thermal">

          {/* HEADER */}
          <div className="pt-center pt-bold" style={{ fontSize: "18px" }}>
            OG-PMS
          </div>
          <div className="pt-center pt-bold">
            Hotel & Restaurant
          </div>
          <div className="pt-center">
            State Highway 24, Rewa Road
          </div>
          <div className="pt-center">
            GSTIN: 23AZPPK0181Q1ZW
          </div>
          <div className="pt-center">
            Ph: +91 9755286651
          </div>

          <div className="pt-db-hr" />
          <div className="pt-center pt-bold">TAX INVOICE</div>
          <div className="pt-db-hr" />

          {/* META */}
          <div>
            {`Bill No: ${(billNo || "RB-XXXX").padEnd(20)} Date: ${today}`}
            <br />
            {customer?.name
              ? `Customer: ${customer.name.substring(0, 30)}`
              : ""}
          </div>

          <div className="pt-hr" />

          {/* ITEM HEADER */}
          <div className="pt-bold" style={{ display: "flex" }}>
            <div style={{ flex: 2 }}>ITEM</div>
            <div style={{ width: "30px", textAlign: "right" }}>QTY</div>
            <div style={{ width: "70px", textAlign: "right" }}>AMT</div>
          </div>

          <div className="pt-hr" />

          {/* ITEMS */}
          {(items || []).map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                marginBottom: "3px"
              }}
            >
              <div style={{ flex: 2 }}>
                {item.name.toUpperCase().substring(0, 22)}
              </div>

              <div style={{ width: "30px", textAlign: "right" }}>
                {(item.qty || item.quantity || 1)}
              </div>

              <div style={{ width: "70px", textAlign: "right" }}>
                {(item.price * (item.qty || item.quantity || 1)).toFixed(2)}
              </div>
            </div>
          ))}

          <div className="pt-hr" />

          {/* TOTALS */}
          <div>

            {`SUB TOTAL`.padEnd(28)}
            {totals.subtotal.toFixed(2).padStart(14)}

            <br />

            {discount > 0 &&
              (`DISCOUNT`.padEnd(28) +
                `-${Number(discount).toFixed(2)}`.padStart(14))
            }

            <br />

            {`CGST (${gstPercent / 2}%)`.padEnd(28)}
            {(totals.gstAmount / 2).toFixed(2).padStart(14)}

            <br />

            {`SGST (${gstPercent / 2}%)`.padEnd(28)}
            {(totals.gstAmount / 2).toFixed(2).padStart(14)}

            <br />

            {Number(totals.roundOff) !== 0 &&
              (`ROUND OFF`.padEnd(28) +
                String(totals.roundOff).padStart(14))
            }

            <div className="pt-db-hr" />

            <div className="pt-bold" style={{ fontSize: "16px" }}>
              {`NET PAYABLE`.padEnd(20)}
              {`₹${totals.finalAmount}`.padStart(16)}
            </div>

            <div className="pt-db-hr" />
          </div>

          {/* FOOTER */}
          <div className="pt-center" style={{ marginTop: "12px" }}>
            <div className="pt-bold">THANK YOU!</div>
            <div style={{ marginTop: "5px" }}>
              www.theogdevelopers.com
            </div>
            <div style={{ marginTop: "8px", fontSize: "10px" }}>
              — Software by The OG Developers —
            </div>
          </div>

          {/* FEED SPACE */}
          <div style={{ height: "10mm" }} />

        </div>

      </div>
    </>
  )
}