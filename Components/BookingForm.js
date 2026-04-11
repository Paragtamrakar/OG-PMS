"use client";

import { useState } from "react";
import { CheckCircle, Plus } from "lucide-react";

export default function BookingForm({ room, onBookingSuccess }) {
  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState([
    { name: "", idType: "", idNumber: "", age: "" }
  ]);
  const initialForm = {
    guestName: "",
    phone: "",
    idType: "",
    idNumber: "",
    fatherName: "",
    age: "",
    numberOfGuests: "",
    fromCity: "",
    toCity: "",
    vehicleNumber: "",
    purposeOfVisit: "",
    address: "",
    checkIn: "",
    checkOut: ""
  };

  const [form, setForm] = useState(initialForm)

  // guest add function 
  function addGuest() {
    setGuests([
      ...guests,
      { name: "", idType: "", idNumber: "", age: "" }
    ]);
  }
  function updateGuest(index, field, value) {
    const updated = [...guests];
    updated[index][field] = value;
    setGuests(updated);
  }

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSaveBooking() {
    try {
      setLoading(true);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSnapshot: {
            roomNo: room.roomNo,
            name: room.name,
            pricePerNight: room.pricing.base
          },
          guest: {
            name: form.guestName,
            phone: form.phone,
            idType: form.idType,
            idNumber: form.idNumber,

            fatherName: form.fatherName,
            age: form.age,
            fromCity: form.fromCity,
            toCity: form.toCity,
            vehicleNumber: form.vehicleNumber,
            purposeOfVisit: form.purposeOfVisit,

            address: form.address
          },
          guests: guests,   // ⭐ NEW
          checkIn: new Date().toISOString(),
          checkOut: form.checkOut
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Room already booked for these dates");
        console.error(data);
        return;
      }

      if (onBookingSuccess) {
        onBookingSuccess(data.booking);
      }
      // 🔥 RESET FORM HERE
      setGuests([{ name: "", idType: "", idNumber: "", age: "" }])
      setForm(initialForm)
      console.log("Saved booking:", data.booking);
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className=" space-y-4 ">

      <div className="bg-emerald-50 border  border-emerald-100 p-4 rounded-lg flex items-center gap-3 text-emerald-700 mb-6">
        <CheckCircle size={24} />
        <span className="font-medium">Room is available for booking</span>
      </div>

      {/* Guest Name */}
      <input
        name="guestName"
        value={form.guestName}
        onChange={update}
        required
        placeholder="Guest Full Name"
        className="w-full border-2 border-slate-200 rounded-lg p-3"
      />

      <input
        name="fatherName"
        value={form.fatherName}
        onChange={update}
        placeholder="Father Name"
        className="w-full border-2 border-slate-200 rounded-lg p-3"
      />
      {/* ID */}
      <div className="grid grid-cols-2 gap-4">
        <select
          name="idType"
          value={form.idType}
          onChange={update}
          required
          className="border-2 border-slate-200 rounded-lg p-3"
        >
          <option value="">Select ID Type</option>
          <option value="Aadhaar">Aadhaar Card</option>
          <option value="Passport">Passport</option>
          <option value="Driving License">Driving License</option>
          <option value="Voter ID">Voter ID</option>
          <option value="Others">Others</option>
        </select>

        <input
          name="idNumber"
          value={form.idNumber}
          onChange={update}
          required
          placeholder="ID Number"
          className="border-2 border-slate-200 rounded-lg p-3"
        />
      </div>

      {/* Phone */}
      <input
        name="phone"
        value={form.phone}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, ""); // sirf numbers allow
          if (value.length <= 10) {
            update({
              target: { name: "phone", value }
            });
          }
        }}
        required
        inputMode="numeric"
        pattern="[0-9]{10}"
        maxLength={10}
        placeholder="Mobile Number"
        className="w-full border-2 border-slate-200 rounded-lg p-3"
      />

      {/* Other Guests */}

      <div className="space-y-3">

        <div className="font-semibold text-slate-600">
          Other Guests
        </div>

        {guests.map((g, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 border p-3 rounded-lg">

            <input
              placeholder="Guest Name"
              value={g.name}
              onChange={(e) => updateGuest(i, "name", e.target.value)}
              className="border-2 border-slate-200 rounded-lg p-2"
            />

            <select
              value={g.idType}
              onChange={(e) => updateGuest(i, "idType", e.target.value)}
              className="border-2 border-slate-200 rounded-lg p-2"
            >
              <option value="">ID Type</option>
              <option value="Aadhaar">Aadhaar</option>
              <option value="Passport">Passport</option>
              <option value="Driving License">Driving License</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Others">Others</option>
            </select>

            <input
              placeholder="ID Number"
              value={g.idNumber}
              onChange={(e) => updateGuest(i, "idNumber", e.target.value)}
              className="border-2 border-slate-200 rounded-lg p-2"
            />

            <input
              placeholder="Age"
              value={g.age}
              onChange={(e) => updateGuest(i, "age", e.target.value)}
              className="border-2 border-slate-200 rounded-lg p-2"
            />

          </div>
        ))}

        <button
          type="button"
          onClick={addGuest}
          className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg"
        >
          + Add Another Guest
        </button>

      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="date"
          name="checkIn"
          value={form.checkIn}
          onChange={update}
          required
          className="border-2 border-slate-200 rounded-lg p-3"
        />

        <input
          type="date"
          name="checkOut"
          value={form.checkOut}
          onChange={update}
          required
          className="border-2 border-slate-200 rounded-lg p-3"
        />
      </div>

      {/* Travel Info  */}
      <div className="grid grid-cols-2 gap-4">

        <input
          name="fromCity"
          value={form.fromCity}
          onChange={update}
          placeholder="From City"
          className="border-2 border-slate-200 rounded-lg p-3"
        />

        <input
          name="toCity"
          value={form.toCity}
          onChange={update}
          placeholder="Going To"
          className="border-2 border-slate-200 rounded-lg p-3"
        />

      </div>

      {/* Vehicle number */}
      <input
        name="vehicleNumber"
        value={form.vehicleNumber}
        onChange={update}
        placeholder="Vehicle Number"
        className="w-full border-2 border-slate-200 rounded-lg p-3"
      />

      {/* Purpose of visit  */}
      <input
        name="purposeOfVisit"
        value={form.purposeOfVisit}
        onChange={update}
        placeholder="Purpose of Visit"
        className="w-full border-2 border-slate-200 rounded-lg p-3"
      />
      {/* Address (optional) */}
      <textarea
        name="address"
        value={form.address}
        onChange={update}
        placeholder="Address (optional)"
        className="w-full border-2 border-slate-200 rounded-lg p-3"
      />

      {/* Rate */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase">
          Daily Rate
        </div>
        <div className="text-xl font-bold text-slate-700">
          ₹{room.pricing.base}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSaveBooking}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        {loading ? "Saving..." : "CONFIRM CHECK-IN"}
      </button>
    </div>
  );
}
