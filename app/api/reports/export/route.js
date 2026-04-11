import { connectDB } from "@/Mongodb/db";
import RestaurantBill from "@/Schema/RestaurantBill";
import Invoice from "@/Schema/Invoice";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(req) {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");
    const from = new Date(fromStr);
    const to = new Date(toStr);

    to.setHours(23, 59, 59, 999);

    const restaurantBills = await RestaurantBill.find({
        createdAt: { $gte: from, $lte: to }
    });

    const roomInvoices = await Invoice.find({
        createdAt: { $gte: from, $lte: to }
    });

    // 1. Prepare Sales Register Data (Sheet 1)
    const salesRegisterData = [];

    // Totals for Summary Sheet (Sheet 2) logic
    let roomTaxable = 0, roomGst = 0, roomTotal = 0;
    let foodTaxable = 0, foodGst = 0, foodTotal = 0;

    // Process Restaurant Bills
    restaurantBills.forEach(bill => {
        const taxable = bill.subtotal || 0;
        const gst = bill.gstAmount || 0;
        const total = bill.finalAmount || 0;
        const gstRate = taxable > 0 ? (gst / taxable) : 0;

        salesRegisterData.push({
            "Date": bill.createdAt.toLocaleDateString('en-GB'),
            "Reference No": bill.billNo,
            "Source": "RESTAURANT",
            "Supply Type": "B2C",
            "Place of Supply": "Madhya Pradesh (23)",
            "Customer Name": bill.customer?.name || "Cash/General",
            "Taxable Amount": taxable,
            "GST Rate (%)": (gstRate * 100).toFixed(2) + "%",
            "CGST": gst / 2,
            "SGST": gst / 2,
            "Invoice Total": total
        });

        foodTaxable += taxable;
        foodGst += gst;
        foodTotal += total;
    });

    // Process Room Invoices
    roomInvoices.forEach(inv => {
        const taxable = (inv.roomTotal || 0) + (inv.foodTotal || 0);
        const gst = inv.gstAmount || 0;
        const total = inv.grandTotal || 0;
        const gstRate = taxable > 0 ? (gst / taxable) : 0;

        salesRegisterData.push({
            "Date": inv.createdAt.toLocaleDateString('en-GB'),
            "Reference No": inv.invoiceNumber,
            "Source": "ROOM",
            "Supply Type": "B2C",
            "Place of Supply": "Madhya Pradesh (23)",
            "Customer Name": inv.guestName,
            "Taxable Amount": taxable,
            "GST Rate (%)": (gstRate * 100).toFixed(2) + "%",
            "CGST": gst / 2,
            "SGST": gst / 2,
            "Invoice Total": total
        });

        roomTaxable += taxable;
        roomGst += gst;
        roomTotal += total;
    });

    // 2. Prepare GST Summary Data (Sheet 2)
    const gstSummaryData = [
        { "Category": "ROOM", "Taxable Value": roomTaxable, "CGST": roomGst / 2, "SGST": roomGst / 2, "Total GST": roomGst, "Gross Revenue": roomTotal },
        { "Category": "RESTAURANT", "Taxable Value": foodTaxable, "CGST": foodGst / 2, "SGST": foodGst / 2, "Total GST": foodGst, "Gross Revenue": foodTotal },
        { "Category": "TOTAL", "Taxable Value": roomTaxable + foodTaxable, "CGST": (roomGst + foodGst) / 2, "SGST": (roomGst + foodGst) / 2, "Total GST": roomGst + foodGst, "Gross Revenue": roomTotal + foodTotal }
    ];

    // 3. Prepare Management Summary (Sheet 3)
    const managementData = [
        { "Metric": "Report Period", "Amount": `${from.toLocaleDateString('en-GB')} to ${to.toLocaleDateString('en-GB')}` },
        { "Metric": "Total Revenue (Gross)", "Amount": roomTotal + foodTotal },
        { "Metric": "Room Revenue (Taxable)", "Amount": roomTaxable },
        { "Metric": "Food Revenue (Taxable)", "Amount": foodTaxable },
        { "Metric": "Total GST Collected", "Amount": roomGst + foodGst }
    ];

    const workbook = XLSX.utils.book_new();

    // Create Sales Register Sheet
    const ws1 = XLSX.utils.json_to_sheet(salesRegisterData, { origin: "A4" });
    // Apply borders to all data cells (audit-style grid)
    Object.keys(ws1).forEach(cell => {
        if (cell[0] === "!") return;
        ws1[cell].s = {
            border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
            }
        };
    });

    // Add professional header to Sheet 1
    XLSX.utils.sheet_add_aoa(ws1, [
        ["  — CONSOLIDATED SALES REPORT"],
        [`Report From: ${from.toLocaleDateString('en-GB')} To: ${to.toLocaleDateString('en-GB')}`],
        []
    ], { origin: "A1" });

    // Column widths for professional look
    const wscols = [
        { wch: 12 }, // Date
        { wch: 20 }, // Ref
        { wch: 14 }, // Source
        { wch: 10 }, // Supply Type
        { wch: 22 }, // Place of Supply
        { wch: 25 }, // Customer
        { wch: 15 }, // Taxable
        { wch: 12 }, // GST Rate
        { wch: 14 }, // CGST
        { wch: 14 }, // SGST
        { wch: 16 }  // Total
    ];
    const range = XLSX.utils.decode_range(ws1["!ref"]);

    for (let R = 4; R <= range.e.r; ++R) {
        ["G", "I", "J", "K"].forEach(col => {
            const cell = ws1[`${col}${R + 1}`];
            if (cell && typeof cell.v === "number") {
                cell.z = '"₹"#,##0.00';
            }
        });
    }
    ws1["!cols"] = wscols;
    
    // Add subtle branding at bottom of Sales Register
    const srRange = XLSX.utils.decode_range(ws1["!ref"]);
    const srLastRow = srRange.e.r + 3;

    XLSX.utils.sheet_add_aoa(ws1, [
        [],
        ["Prepared by: The OG Developers"]
    ], { origin: `A${srLastRow + 1}` });

    // Create GST Summary Sheet
    const ws2 = XLSX.utils.json_to_sheet(gstSummaryData);
    ws2["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }];

    // Create Management Sheet
    const ws3 = XLSX.utils.json_to_sheet(managementData);
    ws3["!cols"] = [{ wch: 25 }, { wch: 20 }];

    // Append Sheets
    XLSX.utils.book_append_sheet(workbook, ws1, "Sales Register");
    XLSX.utils.book_append_sheet(workbook, ws2, "GST Summary");
    XLSX.utils.book_append_sheet(workbook, ws3, "Business Summary");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
        headers: {
            "Content-Disposition": `attachment; filename=__Report_${fromStr}_to_${toStr}.xlsx`,
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    });
}