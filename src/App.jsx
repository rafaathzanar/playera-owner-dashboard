import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Home from "./pages/Home";
import Venues from "./pages/Venues";
import AddVenue from "./pages/AddVenue";
import EditVenue from "./pages/EditVenue";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/venues" element={<Venues />} />
        <Route path="/add-venue" element={<AddVenue />} />
        <Route path="/edit-venue/:id" element={<EditVenue />} />
      </Routes>
    </Router>
  );
}
