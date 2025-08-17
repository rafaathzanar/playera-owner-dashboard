import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-secondary text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Venue Owner Dashboard</h1>
      <ul className="flex space-x-4">
        <li>
          <Link to="/" className="hover:text-black">Home</Link>
        </li>
        <li>
          <Link to="/venues" className="hover:text-black">Venues</Link>
        </li>
        <li>
          <Link to="/add-venue" className="hover:text-black">Add Venue</Link>
        </li>
        {/* placeholders for future */}
        <li>
          <Link to="/bookings" className="hover:text-black">Bookings and Reports</Link>
        </li>
      </ul>
    </nav>
  );
}
