import React from "react";
import { Link } from "react-router-dom";

export default function Venues() {
  // Mock data for demonstration
  const venues = [
    {
      id: 1,
      name: "Cricket Indoor",
      location: "Kandy",
      openTime: "08:00",
      closeTime: "22:00",
    },
    {
      id: 2,
      name: "Football Arena",
      location: "Colombo",
      openTime: "07:00",
      closeTime: "20:00",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Venues</h2>
      <Link to="/add-venue" className="bg-blue-500 text-white px-4 py-2 rounded">
        + Add Venue
      </Link>

      <div className="mt-6 space-y-4">
        {venues.map((venue) => (
          <div key={venue.id} className="p-4 bg-gray-100 rounded flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">{venue.name}</h3>
              <p className="text-gray-700">Location: {venue.location}</p>
              <p className="text-gray-700">
                Open: {venue.openTime} - {venue.closeTime}
              </p>
            </div>
            <Link to={`/edit-venue/${venue.id}`} className="text-blue-500 underline">
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
