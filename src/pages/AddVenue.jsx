import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeftIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function AddVenue() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Basic Information
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    address: '',
    location: '',
    description: '',
    contactNo: '',
    email: '',
    website: '',
    latitude: '',
    longitude: '',
    venueType: 'INDOOR',
    maxCapacity: '',
    status: 'ACTIVE'
  });



  // Business Hours
  const [businessHours, setBusinessHours] = useState({
    openingHours: '6:00 AM - 11:00 PM'
  });

  const handleBasicInfoChange = (field, value) => {
    setBasicInfo(prev => ({ ...prev, [field]: value }));
  };



  const handleBusinessHoursChange = (field, value) => {
    setBusinessHours(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!basicInfo.maxCapacity || basicInfo.maxCapacity.trim() === '') {
        alert('Maximum Capacity is required. Please enter a value.');
        setLoading(false);
        return;
      }

      // Prepare venue data for backend
      const venueData = {
        name: basicInfo.name,
        address: basicInfo.address,
        location: basicInfo.location,
        description: basicInfo.description,
        contactNo: basicInfo.contactNo,
        email: basicInfo.email,
        website: basicInfo.website,
        latitude: basicInfo.latitude || null,
        longitude: basicInfo.longitude || null,
        venueType: basicInfo.venueType,
        maxCapacity: parseInt(basicInfo.maxCapacity),
        status: basicInfo.status,

        openingHours: businessHours.openingHours,
        // Add owner ID to associate venue with the current user
        ownerId: user.userId
      };

      console.log("Creating venue:", venueData);
      
      // Make real API call to create venue
      const response = await api.createVenue(venueData);
      console.log("Venue created successfully:", response);
      
      // Navigate back to venues page
      navigate("/venues");
    } catch (error) {
      console.error("Error creating venue:", error);
      alert("Failed to create venue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', name: 'Basic Information', icon: BuildingOfficeIcon },
    { id: 'hours', name: 'Business Hours', icon: ClockIcon }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={basicInfo.name}
                  onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter venue name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Type *
                </label>
                <select
                  required
                  value={basicInfo.venueType}
                  onChange={(e) => handleBasicInfoChange('venueType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="INDOOR">Indoor</option>
                  <option value="OUTDOOR">Outdoor</option>
                  <option value="MIXED">Mixed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                required
                value={basicInfo.address}
                onChange={(e) => handleBasicInfoChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter full address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location/City *
                </label>
                <input
                  type="text"
                  required
                  value={basicInfo.location}
                  onChange={(e) => handleBasicInfoChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Colombo, Kandy"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Capacity *
                </label>
                <input
                  type="number"
                  required
                  value={basicInfo.maxCapacity}
                  onChange={(e) => handleBasicInfoChange('maxCapacity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Maximum number of people"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  value={basicInfo.contactNo}
                  onChange={(e) => handleBasicInfoChange('contactNo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="+94 77 123 4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={basicInfo.email}
                  onChange={(e) => handleBasicInfoChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="info@venue.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={basicInfo.website}
                onChange={(e) => handleBasicInfoChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://www.venue.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={basicInfo.description}
                onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe your venue, facilities, and what makes it special..."
              />
            </div>
          </div>
        );



      case 'hours':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-sm font-medium text-blue-900">Business Hours</h3>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Set the general operating hours for your venue. Individual court hours and pricing will be configured separately.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Hours *
              </label>
              <input
                type="text"
                required
                value={businessHours.openingHours}
                onChange={(e) => handleBusinessHoursChange('openingHours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., 6:00 AM - 11:00 PM"
              />
              <p className="text-sm text-gray-500 mt-1">
                This will be displayed to customers in the mobile app
              </p>
            </div>
          </div>
        );





      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate("/venues")}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Venue</h1>
              <p className="text-gray-600 mt-2">Create a new sports venue with comprehensive details</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 inline mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {renderTabContent()}
              
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/venues")}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
