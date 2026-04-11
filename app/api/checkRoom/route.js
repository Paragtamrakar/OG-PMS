async function handleCheckDates({ checkIn, checkOut }) {
  setSelectedDates({ checkIn, checkOut });

  const res = await fetch(
    `/api/bookings?checkIn=${checkIn}&checkOut=${checkOut}`
  );
  const bookings = await res.json();

  // ❗ OCCUPIED ROOMS NIKAALO
  const occupied = bookings.map(
    (b) => b.roomSnapshot.roomNo
  );

  setOccupiedRooms(occupied);
}
