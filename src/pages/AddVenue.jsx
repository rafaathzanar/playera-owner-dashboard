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
  ClockIcon,
  CogIcon
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

  // Amenities
  const [amenities, setAmenities] = useState({
    parkingAvailable: false,
    foodAvailable: false,
    changingRoomsAvailable: false,
    showerAvailable: false,
    wifiAvailable: false
  });

  // Business Hours & Pricing
  const [businessHours, setBusinessHours] = useState({
    openingHours: '6:00 AM - 11:00 PM',
    basePrice: '',
    cancellationPolicy: '',
    refundPolicy: ''
  });

  // Dynamic Pricing
  const [dynamicPricing, setDynamicPricing] = useState({
    dynamicPricingEnabled: false,
    peakHourMultiplier: 1.5,
    offPeakMultiplier: 0.8,
    weekendMultiplier: 1.2,
    holidayMultiplier: 1.3,
    peakHourStart: '18:00',
    peakHourEnd: '22:00'
  });

  // Booking Rules
  const [bookingRules, setBookingRules] = useState({
    autoApprovalEnabled: false,
    minAdvanceBookingHours: 24,
    maxAdvanceBookingDays: 30,
    earliestBookingTime: '06:00',
    latestBookingTime: '23:00',
    commissionRate: 0.10
  });

  const handleBasicInfoChange = (field, value) => {
    setBasicInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenitiesChange = (field, value) => {
    setAmenities(prev => ({ ...prev, [field]: value }));
  };

  const handleBusinessHoursChange = (field, value) => {
    setBusinessHours(prev => ({ ...prev, [field]: value }));
  };

  const handleDynamicPricingChange = (field, value) => {
    setDynamicPricing(prev => ({ ...prev, [field]: value }));
  };

  const handleBookingRulesChange = (field, value) => {
    setBookingRules(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
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
        maxCapacity: basicInfo.maxCapacity ? parseInt(basicInfo.maxCapacity) : null,
        status: basicInfo.status,
        parkingAvailable: amenities.parkingAvailable,
        foodAvailable: amenities.foodAvailable,
        changingRoomsAvailable: amenities.changingRoomsAvailable,
        showerAvailable: amenities.showerAvailable,
        wifiAvailable: amenities.wifiAvailable,
        basePrice: businessHours.basePrice ? parseFloat(businessHours.basePrice) : null,
        openingHours: businessHours.openingHours,
        cancellationPolicy: businessHours.cancellationPolicy,
        refundPolicy: businessHours.refundPolicy,
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
    { id: 'amenities', name: 'Amenities', icon: CogIcon },
    { id: 'pricing', name: 'Pricing & Hours', icon: CurrencyDollarIcon },
    { id: 'dynamic', name: 'Dynamic Pricing', icon: ClockIcon },
    { id: 'booking', name: 'Booking Rules', icon: ClockIcon }
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
                  Max Capacity
                </label>
                <input
                  type="number"
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

      case 'amenities':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Available Amenities</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(amenities).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={key}
                    checked={value}
                    onChange={(e) => handleAmenitiesChange(key, e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor={key} className="ml-3 text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Hours
              </label>
              <input
                type="text"
                value={businessHours.openingHours}
                onChange={(e) => handleBusinessHoursChange('openingHours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., 6:00 AM - 11:00 PM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price per Hour (LKR)
              </label>
              <input
                type="number"
                step="0.01"
                value={businessHours.basePrice}
                onChange={(e) => handleBusinessHoursChange('basePrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="800.00"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Policy
                </label>
                <textarea
                  rows={3}
                  value={businessHours.cancellationPolicy}
                  onChange={(e) => handleBusinessHoursChange('cancellationPolicy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe your cancellation policy..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Policy
                </label>
                <textarea
                  rows={3}
                  value={businessHours.refundPolicy}
                  onChange={(e) => handleBusinessHoursChange('refundPolicy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe your refund policy..."
                />
              </div>
            </div>
          </div>
        );

      case 'dynamic':
        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="dynamicPricingEnabled"
                checked={dynamicPricing.dynamicPricingEnabled}
                onChange={(e) => handleDynamicPricingChange('dynamicPricingEnabled', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="dynamicPricingEnabled" className="ml-3 text-sm font-medium text-gray-700">
                Enable Dynamic Pricing
              </label>
            </div>

            {dynamicPricing.dynamicPricingEnabled && (
              <div className="space-y-6 pl-6 border-l-2 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peak Hour Start
                    </label>
                    <input
                      type="time"
                      value={dynamicPricing.peakHourStart}
                      onChange={(e) => handleDynamicPricingChange('peakHourStart', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peak Hour End
                    </label>
                    <input
                      type="time"
                      value={dynamicPricing.peakHourEnd}
                      onChange={(e) => handleDynamicPricingChange('peakHourEnd', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peak Hour Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={dynamicPricing.peakHourMultiplier}
                      onChange={(e) => handleDynamicPricingChange('peakHourMultiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Off-Peak Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={dynamicPricing.offPeakMultiplier}
                      onChange={(e) => handleDynamicPricingChange('offPeakMultiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weekend Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={dynamicPricing.weekendMultiplier}
                      onChange={(e) => handleDynamicPricingChange('weekendMultiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Holiday Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={dynamicPricing.holidayMultiplier}
                      onChange={(e) => handleDynamicPricingChange('holidayMultiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'booking':
        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoApprovalEnabled"
                checked={bookingRules.autoApprovalEnabled}
                onChange={(e) => handleBookingRulesChange('autoApprovalEnabled', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="autoApprovalEnabled" className="ml-3 text-sm font-medium text-gray-700">
                Enable Auto-Approval for Bookings
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Advance Booking (Hours)
                </label>
                <input
                  type="number"
                  value={bookingRules.minAdvanceBookingHours}
                  onChange={(e) => handleBookingRulesChange('minAdvanceBookingHours', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Advance Booking (Days)
                </label>
                <input
                  type="number"
                  value={bookingRules.maxAdvanceBookingDays}
                  onChange={(e) => handleBookingRulesChange('maxAdvanceBookingDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Earliest Booking Time
                </label>
                <input
                  type="time"
                  value={bookingRules.earliestBookingTime}
                  onChange={(e) => handleBookingRulesChange('earliestBookingTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latest Booking Time
                </label>
                <input
                  type="time"
                  value={bookingRules.latestBookingTime}
                  onChange={(e) => handleBookingRulesChange('latestBookingTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={bookingRules.commissionRate}
                onChange={(e) => handleBookingRulesChange('commissionRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0.10"
              />
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
