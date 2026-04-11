/**
 * ROOM MASTER DATA
 * Source of truth for room inventory (frontend phase)
 * Later this will be replaced by DB / API
 */

export const ROOMS = [
  {
    id: "RM-101",
    roomNo: 101,
    name: "Standard Single",
    category: "STANDARD",
    bedType: "Single",
    maxGuests: 1,
    floor: 1,
    amenities: ["WiFi", "TV", "Fan"],
    pricing: {
      base: 1500,
      extraPerson: 300,
      weekendMultiplier: 1.0
    },
    status: "ACTIVE"
  },
  {
    id: "RM-102",
    roomNo: 102,
    name: "Standard Single",
    category: "STANDARD",
    bedType: "Single",
    maxGuests: 1,
    floor: 1,
    amenities: ["WiFi", "TV", "Fan"],
    pricing: {
      base: 1500,
      extraPerson: 300,
      weekendMultiplier: 1.0
    },
    status: "ACTIVE"
  },
  {
    id: "RM-103",
    roomNo: 103,
    name: "Deluxe Double",
    category: "DELUXE",
    bedType: "Double",
    maxGuests: 2,
    floor: 1,
    amenities: ["WiFi", "TV", "AC", "Geyser"],
    pricing: {
      base: 2500,
      extraPerson: 500,
      weekendMultiplier: 1.1
    },
    status: "ACTIVE"
  },
  {
    id: "RM-104",
    roomNo: 104,
    name: "Deluxe Double",
    category: "DELUXE",
    bedType: "Double",
    maxGuests: 2,
    floor: 1,
    amenities: ["WiFi", "TV", "AC", "Geyser"],
    pricing: {
      base: 2500,
      extraPerson: 500,
      weekendMultiplier: 1.1
    },
    status: "ACTIVE"
  },
  {
    id: "RM-201",
    roomNo: 201,
    name: "Executive Suite",
    category: "SUITE",
    bedType: "King",
    maxGuests: 3,
    floor: 2,
    amenities: ["WiFi", "TV", "AC", "Mini Fridge", "Sofa"],
    pricing: {
      base: 4500,
      extraPerson: 800,
      weekendMultiplier: 1.15
    },
    status: "ACTIVE"
  },
  {
    id: "RM-202",
    roomNo: 202,
    name: "Executive Suite",
    category: "SUITE",
    bedType: "King",
    maxGuests: 3,
    floor: 2,
    amenities: ["WiFi", "TV", "AC", "Mini Fridge", "Sofa"],
    pricing: {
      base: 4500,
      extraPerson: 800,
      weekendMultiplier: 1.15
    },
    status: "ACTIVE"
  },
  {
    id: "RM-203",
    roomNo: 203,
    name: "Presidential Suite",
    category: "PREMIUM",
    bedType: "King",
    maxGuests: 4,
    floor: 2,
    amenities: ["WiFi", "TV", "AC", "Jacuzzi", "Mini Bar"],
    pricing: {
      base: 8500,
      extraPerson: 1200,
      weekendMultiplier: 1.2
    },
    status: "ACTIVE"
  },
  {
    id: "RM-301",
    roomNo: 301,
    name: "Twin Sharing",
    category: "STANDARD",
    bedType: "Twin",
    maxGuests: 2,
    floor: 3,
    amenities: ["WiFi", "TV", "Fan"],
    pricing: {
      base: 1800,
      extraPerson: 400,
      weekendMultiplier: 1.0
    },
    status: "ACTIVE"
  },
  {
    id: "RM-302",
    roomNo: 302,
    name: "Twin Sharing",
    category: "STANDARD",
    bedType: "Twin",
    maxGuests: 2,
    floor: 3,
    amenities: ["WiFi", "TV", "Fan"],
    pricing: {
      base: 1800,
      extraPerson: 400,
      weekendMultiplier: 1.0
    },
    status: "ACTIVE"
  },
  {
    id: "RM-303",
    roomNo: 303,
    name: "Penthouse",
    category: "LUXURY",
    bedType: "King",
    maxGuests: 5,
    floor: 3,
    amenities: ["WiFi", "TV", "AC", "Private Terrace", "Mini Bar"],
    pricing: {
      base: 12000,
      extraPerson: 1500,
      weekendMultiplier: 1.25
    },
    status: "ACTIVE"
  }
];
