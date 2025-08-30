import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Venues from "./pages/Venues";
import AddVenue from "./pages/AddVenue";
import EditVenue from "./pages/EditVenue";
import VenueDetails from "./pages/VenueDetails";
import CourtManagement from "./pages/CourtManagement";
import EquipmentManagement from "./pages/EquipmentManagement";
import TimeSlotManagement from "./pages/TimeSlotManagement";
import DynamicPricing from "./pages/DynamicPricing";
import BookingManagement from "./pages/BookingManagement";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/venues" element={<Venues />} />
        <Route path="/venues/:id" element={<VenueDetails />} />
        <Route path="/add-venue" element={<AddVenue />} />
        <Route path="/edit-venue/:id" element={<EditVenue />} />
        <Route path="/venues/:venueId/courts" element={<CourtManagement />} />
        <Route path="/venues/:venueId/equipment" element={<EquipmentManagement />} />
        <Route path="/venues/:venueId/timeslots" element={<TimeSlotManagement />} />
        <Route path="/venues/:venueId/pricing" element={<DynamicPricing />} />
        <Route path="/bookings" element={<BookingManagement />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}
