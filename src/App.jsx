import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/NavBar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Venues from "./pages/Venues";
import AddVenue from "./pages/AddVenue";
import EditVenue from "./pages/EditVenue";
import AddCourt from "./pages/AddCourt";
import EditCourt from "./pages/EditCourt";
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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Dashboard />
              </>
            </ProtectedRoute>
          } />
          <Route path="/venues" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Venues />
              </>
            </ProtectedRoute>
          } />
          <Route path="/venues/:id" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <VenueDetails />
              </>
            </ProtectedRoute>
          } />
          <Route path="/add-venue" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <AddVenue />
              </>
            </ProtectedRoute>
          } />
          <Route path="/add-court/:venueId" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <AddCourt />
              </>
            </ProtectedRoute>
          } />
          <Route path="/edit-court/:courtId" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <EditCourt />
              </>
            </ProtectedRoute>
          } />
          <Route path="/edit-venue/:venueId" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <EditVenue />
              </>
            </ProtectedRoute>
          } />
          <Route path="/venues/:venueId/courts" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <CourtManagement />
              </>
            </ProtectedRoute>
          } />
          <Route path="/venues/:venueId/equipment" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <EquipmentManagement />
              </>
            </ProtectedRoute>
          } />
          <Route path="/venues/:venueId/timeslots" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <TimeSlotManagement />
              </>
            </ProtectedRoute>
          } />
          <Route path="/venues/:venueId/pricing" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <DynamicPricing />
              </>
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <BookingManagement />
              </>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Analytics />
              </>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Settings />
              </>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
