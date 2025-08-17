import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourtFields from "../components/CourtFields";

export default function EditVenue() {
  const navigate = useNavigate();
  const { venueId } = useParams();

  const [venue, setVenue] = useState({
    name: "",
    location: "",
    openTime: "",
    closeTime: "",
    description: "",
    courts: [],
  });

  useEffect(() => {
    // Simulating API call to fetch venue details
    const fetchVenueData = async () => {
      const response = await fetch(`/api/venues/${venueId}`);
      const data = await response.json();
      setVenue(data);
    };
    fetchVenueData();
  }, [venueId]);

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

  // Handle venue field changes
  const handleVenueChange = (field, value) => {
    setVenue((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update courts' slots if open/close time changes
  useEffect(() => {
    if (venue.openTime && venue.closeTime) {
      setVenue((prev) => ({
        ...prev,
        courts: prev.courts.map((court) => ({
          ...court,
          timeSlots: generateTimeSlots(venue.openTime, venue.closeTime),
        })),
      }));
    }
  }, [venue.openTime, venue.closeTime]);

  const handleSave = async (e) => {
    e.preventDefault();

    // Simulated API call to update venue
    const response = await fetch(`/api/venues/${venueId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(venue),
    });

    if (response.ok) {
      alert("Venue updated successfully!");
      navigate("/venues");
    } else {
      alert("Error updating venue");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Venue</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="font-semibold block mb-1">Venue Name</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={venue.name}
            onChange={(e) => handleVenueChange("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="font-semibold block mb-1">Location</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={venue.location}
            onChange={(e) => handleVenueChange("location", e.target.value)}
            required
          />
        </div>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="font-semibold block mb-1">Open Time</label>
            <input
              type="time"
              className="border p-2 rounded w-full"
              value={venue.openTime}
              onChange={(e) => handleVenueChange("openTime", e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label className="font-semibold block mb-1">Close Time</label>
            <input
              type="time"
              className="border p-2 rounded w-full"
              value={venue.closeTime}
              onChange={(e) => handleVenueChange("closeTime", e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="font-semibold block mb-1">Description</label>
          <textarea
            className="border p-2 rounded w-full"
            value={venue.description}
            onChange={(e) => handleVenueChange("description", e.target.value)}
          />
        </div>

        {/* Courts Section */}
        <CourtFields courts={venue.courts} setCourts={(updatedCourts) => setVenue({ ...venue, courts: updatedCourts })} timeSlots={generateTimeSlots(venue.openTime, venue.closeTime)} />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Update Venue
        </button>
      </form>
    </div>
  );
}
