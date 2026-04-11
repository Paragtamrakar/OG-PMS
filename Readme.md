# 🏨 OG-PMS – Hotel Management & Restaurant POS System

A **full-stack hotel management and restaurant billing system**.

The system handles **room bookings, guest verification, restaurant POS billing, GST reporting, and police register export** in one unified platform.

Built with **Next.js, MongoDB, and Tailwind CSS**.

---

# 📌 Overview

This software manages the **daily operations of a hotel + restaurant**:

* **Room booking** and availability management
* **Guest identity** verification
* **Restaurant billing** (POS system)
* **Checkout** and invoice generation
* **GST reporting** and accounting exports
* **Police register** export for compliance

The system is designed specifically for **real hotel workflows**, including:

* Multi-guest bookings
* GST billing
* Thermal receipt printing
* Police reporting

---

# ✨ Features

## 🛏 Room Management

* Visual room inventory grid
* Available / Occupied room indicators
* Date-based availability checking
* Booking overlap protection
* Multi-guest booking support
* Guest identity tracking

## 🍽 Restaurant POS System

### Table-based Restaurant Management System
* Multi-table support
* Visual table grid (Available / Occupied status)
* Live table timer (occupied since X minutes)
* Per-table independent orders (no data loss on switching tables)
* Real-time food menu search
* Add/remove items
* Quantity controls
* Item count per table
* Discount support
* GST calculation
* Round-off billing
* Safe print flow (no data loss)
* Thermal receipt printing
* Invoice generation

### Restaurant System Architecture (NEW)
The restaurant module has been redesigned into a table-based operating system.

#### 🔥 Core Concept
Each table works like an independent session:
* Order starts when the first item is added
* Timer starts automatically
* Data stays in local state
* Final bill is saved only on completion

#### 🧩 Components Overview
* **🪑 TableGrid:** Main dashboard showing all tables, displays available vs occupied status, groups tables by zone, and serves as the entry point.
* **📦 TableCard:** Represents a single table showing name, capacity, live timer, item count, and running total. Changes UI dynamically based on status.
* **🍽 OrderPanel:** Main POS screen handling item selection, quantity updates, billing, GST calculation, and print generation. Works per table.

#### 🧠 State Management
* **`useTables` Hook:** The central brain of the restaurant system. Handles all tables state, per-table orders, item operations, table reset, timer logic, and `localStorage` persistence.

#### 🔄 System Flow
`TableGrid` → `TableCard` → `OrderPanel` → `Bill` → `Print` → `Reset`

#### 💾 Data Strategy
* Orders stored locally (per table).
* No DB calls during order creation.
* DB used only for final bill save.
* Prevents unnecessary API load.

#### 🖨 Printing Flow (Improved)
* Bill data stored before print.
* Print triggered safely.
* Table resets only after print.
* Prevents blank or failed receipts.

#### 📂 Updated Project Structure
```text
components
 ├ BookingForm
 ├ BillingView
 ├ MenuManager
 ├ Navbar
 ├ FoodPanel
 └ Restaurant
     ├ TableGrid.jsx
     ├ TableCard.jsx
     └ OrderPanel.jsx

hooks
 └ useTables.js

data
 └ TABLES.js
```

---

## 🧾 Checkout & Billing

* Room + food combined billing
* Automatic nights calculation
* GST calculation
* Invoice generation
* Payment method selection
* Checkout status tracking

---

## 👮 Guest Verification System

* Search guest by name
* Search by phone number
* Search by ID number
* Booking history lookup

---

## 📑 Police Register Export

Generate official **police guest register** in PDF format. Includes:

* Guest name, father name, phone, address
* ID type and ID number
* Vehicle number
* Purpose of visit
* Stay dates

---

## 📊 Business Reports

Export Excel reports including:

### Sales Register
* Restaurant sales
* Room revenue
* GST breakdown
* Customer details

### GST Summary
* CGST
* SGST
* Taxable revenue

### Management Summary
* Total revenue
* Room revenue
* Food revenue
* GST collected

---

# 🧰 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js (App Router) |
| **Backend** | Next.js Route Handlers |
| **Database** | MongoDB + Mongoose |
| **UI** | Tailwind CSS |
| **Icons** | Lucide React |
| **PDF Export** | jsPDF |
| **Excel Export** | XLSX |
| **Printing** | CSS Thermal Print |

---

# 📂 Project Structure

```text
app
 ├ api
 │   ├ bills
 │   ├ bookings
 │   ├ checkout
 │   ├ checked-in
 │   ├ food
 │   ├ guest-search
 │   ├ police-register
 │   ├ reports
 │   └ restaurantbill
 │
 ├ restaurant
 ├ room
 ├ verify
 │
components
 ├ BookingForm
 ├ BillingView
 ├ MenuManager
 ├ Navbar
 └ FoodPanel

schemas
 ├ Booking
 ├ Invoice
 ├ RestaurantBill
 └ FoodMenu

mongodb
 └ db connection
```

---

# ⚙️ Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/--system.git
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Configure environment variables
Create `.env.local`:
```env
MONGODB_URI=your_mongodb_connection_string
```

### 4️⃣ Run development server
```bash
npm run dev
```
Open: `http://localhost:3000`

---

# 🔌 API Documentation

## Bills
### GET `/api/bills`
Fetch restaurant and room bills between dates.
`/api/bills?from=YYYY-MM-DD&to=YYYY-MM-DD`

**Response:**
```json
{
 "restaurant": [],
 "room": []
}
```

### POST `/api/bills`
Update existing bill. Supports Restaurant bills and Room invoices.

---

# 🛏 Booking APIs

## POST `/api/bookings`
Create a new room booking.

**Example request:**
```json
{
 "roomSnapshot":{
   "roomNo":101,
   "name":"Deluxe Room",
   "pricePerNight":1500
 },
 "guest":{
   "name":"Rahul",
   "phone":"9999999999"
 },
 "checkIn":"2026-03-10",
 "checkOut":"2026-03-12"
}
```

## GET `/api/bookings`
Check room availability.
`/api/bookings?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD`
*Returns overlapping bookings.*

---

# 🍽 Food Menu APIs

* **GET `/api/food`**: Fetch all menu items.
* **POST `/api/food`**: Create new menu item.
* **PUT `/api/food/[id]`**: Update menu item.
* **DELETE `/api/food/[id]`**: Delete menu item.

---

# 🧾 Restaurant Billing

## POST `/api/restaurantbill/create`
Create POS bill.

**Example:**
```json
{
 "items":[...],
 "subtotal":900,
 "gstPercent":5,
 "finalAmount":945
}
```

---

# 👮 Guest Search

## GET `/api/guest-search`
Search guests by name, phone, ID, or booking id.
`/api/guest-search?q=rahul`

---

# 👮 Police Register

## GET `/api/police-register`
Fetch bookings for police reporting.
`/api/police-register?from=YYYY-MM-DD&to=YYYY-MM-DD`

---

# 📊 Reports

## GET `/api/reports/export`
Export **Excel report**. Includes Sales Register, GST Summary, and Business Summary.

---

# 📈 Analytics API

## GET `/api/export`
Returns revenue analytics.

**Response:**
```json
{
 "totalRevenue":120000,
 "roomRevenue":70000,
 "foodRevenue":50000,
 "gstCollected":8000
}
```

---

# 🔐 Business Logic Highlights

### Room Booking Protection
The system prevents **overlapping bookings**:
`checkIn < existingCheckOut` AND `checkOut > existingCheckIn`

### GST Logic
Default GST:
* 5% GST
* CGST = 2.5%
* SGST = 2.5%

### Early Checkout Support
Checkout calculation automatically adjusts nights if the guest leaves early.

---

# 🖨 Thermal Receipt Printing

The POS system supports **80mm thermal printers**.
* Monospace receipt layout
* Automatic print trigger
* GST breakdown
* Itemized billing

---

# 🚀 Future Improvements

* Inventory tracking
* Staff login system
* Online booking system
* Real-time dashboard analytics
* Multi-hotel SaaS version
* Cloud backup system

---

# 👨‍💻 Author

Developed by: **The OG Developers**
*Custom hotel management software.*

---

# 📄 License

Private software developed for **Hotel**. Unauthorized distribution prohibited.