import React from "react";
import playeralogoblack from "../assets/images/playeralogo_black.png";

export default function Home() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome, Venue Owner!</h2>
      <p className="text-gray-700">
        This is your dashboard. From here you can manage venues, courts, and bookings.
      </p>
      <img src={playeralogoblack} alt="Venue Owner" className="w-250 rounded" />
    </div>
  );
}
