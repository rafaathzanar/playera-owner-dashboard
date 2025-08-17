import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CourtFields from "../components/CourtFields";

export default function AddVenue() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [description, setDescription] = useState("");
  const [courts, setCourts] = useState([]);

  // Function to generate 30-minute slots
  const generateTimeSlots = (open, close) => {
    if (!open || !close) return [];
    const slots = [];
    let start = new Date(`1970-01-01T${open}:00`);
    const end = new Date(`1970-01-01T${close}:00`);

    while (start < end) {
      const slotStart = start.toTimeString().slice(0, 5);
      start.setMinutes(start.getMinutes() + 30);
      const slotEnd = start.toTimeString().slice(0, 5);
      slots.push(`${slotStart} - ${slotEnd}`);
    }
    return slots;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Generate slots dynamically based on open and close times
    const timeSlots = generateTimeSlots(openTime, closeTime);

    const newVenue = {
      name,
      location,
      openTime,
      closeTime,
      description,
      courts: courts.map((court) => ({
        ...court,
        timeSlots, // Assign generated slots to each court
      })),
    };

    console.log("Adding Venue:", newVenue);
    navigate("/venues"); // Navigate back after saving
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Add Venue</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-semibold block mb-1">Venue Name</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="font-semibold block mb-1">Location</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="font-semibold block mb-1">Open Time</label>
            <input
              type="time"
              className="border p-2 rounded w-full"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label className="font-semibold block mb-1">Close Time</label>
            <input
              type="time"
              className="border p-2 rounded w-full"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="font-semibold block mb-1">Description</label>
          <textarea
            className="border p-2 rounded w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Courts Section */}
        <CourtFields courts={courts} setCourts={setCourts} timeSlots={generateTimeSlots(openTime, closeTime)} />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Save Venue
        </button>
      </form>
    </div>
  );
}
