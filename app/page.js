"use client";

import { useState } from "react";
import RoomGrid from "./Room/room";
import Sidebar from "@/Components/SideBar";
import CheckRoomAvailability from "@/Components/CheckRoomAvailability";
import RoomCheckout from "@/Components/RoomCheckout";
import Navbar from "@/Components/Navbar";



export default function Home() {
  const [activeRoomNo, setActiveRoomNo] = useState(null);
  const [occupiedRooms, setOccupiedRooms] = useState([]);
  const handleBookingSuccess = (newBooking) => {
    setOccupiedRooms((prev) => {
      const filtered = prev.filter(r => r.roomNo !== newBooking.roomSnapshot.roomNo);

      return [
        ...filtered,
        {
          roomNo: newBooking.roomSnapshot.roomNo,
          checkIn: newBooking.checkIn,
          checkOut: newBooking.checkOut
        }
      ];
    });
  };

  async function handleCheckDates({ checkIn, checkOut }) {
    const res = await fetch(
      `/api/bookings?checkIn=${checkIn}&checkOut=${checkOut}`
    );

    const bookings = await res.json();

    const occupied = bookings.map((b) => ({
      roomNo: b.roomSnapshot.roomNo,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      guestName: b.guestName, // agar hai toh
    }));

    setOccupiedRooms(occupied);


  }

  return (
    <main className="flex flex-1 overflow-hidden p-6 gap-6">
      <div className="flex-[3] overflow-y-auto pr-2">
        <Navbar />
        <CheckRoomAvailability onCheckDates={handleCheckDates} />


        <RoomGrid
          onSelectRoom={setActiveRoomNo}
          occupiedRooms={occupiedRooms}
        />
        <RoomCheckout />

      </div>

      <Sidebar
        activeRoomNo={activeRoomNo}
        activeBooking={null}
        onClose={() => setActiveRoomNo(null)}
        onBookingSuccess={handleBookingSuccess}
      />

    </main>
  );
}
