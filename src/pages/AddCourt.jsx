import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeftIcon,
  PlusIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CogIcon,
  MapPinIcon,
  UserGroupIcon,
  SunIcon,
  CloudIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function AddCourt() {
  const navigate = useNavigate();
  const { venueId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Basic Information
  const [basicInfo, setBasicInfo] = useState({
    courtName: '',
    type: 'BASKETBALL',
    capacity: 10,
    description: '',
    isIndoor: true,
    isLighted: false,
    isAirConditioned: false
  });

  // Pricing & Duration
  const [pricing, setPricing] = useState({
    pricePerHour: 0.0,
    minBookingDuration: 1,
    maxBookingDuration: 4
  });

  // Operating Hours
  const [operatingHours, setOperatingHours] = useState({
    openingTime: '06:00',
    closingTime: '23:00',
    slotDurationMinutes: 30,
    isActiveOnWeekends: true,
    isActiveOnHolidays: false
  });

  // Break Time
  const [breakTime, setBreakTime] = useState({
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00'
  });

  // Dynamic Pricing
  const [dynamicPricing, setDynamicPricing] = useState({
    dynamicPricingEnabled: false,
    peakHourStart: '18:00',
    peakHourEnd: '22:00',
    peakHourMultiplier: 1.5,
    offPeakMultiplier: 0.8,
    weekendMultiplier: 1.2
  });

  // Maintenance
  const [maintenance, setMaintenance] = useState({
    maintenanceMode: false,
    maintenanceStartTime: '00:00',
    maintenanceEndTime: '06:00'
  });

  useEffect(() => {
    // If no venueId in params, try to get it from the current user's venue
    if (!venueId && user?.userId) {
      fetchUserVenue();
    }
  }, [venueId, user]);

  const fetchUserVenue = async () => {
    try {
      const venueData = await api.getVenueByOwner(user.userId);
      if (venueData?.venueId) {
        // Redirect to the correct URL with venueId
        navigate(`/add-court/${venueData.venueId}`, { replace: true });
      }
    } catch (error) {
      console.error("Error fetching user venue:", error);
    }
  };

  const handleBasicInfoChange = (field, value) => {
    setBasicInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePricingChange = (field, value) => {
    setPricing(prev => ({ ...prev, [field]: value }));
  };

  const handleOperatingHoursChange = (field, value) => {
    setOperatingHours(prev => ({ ...prev, [field]: value }));
  };

  const handleBreakTimeChange = (field, value) => {
    setBreakTime(prev => ({ ...prev, [field]: value }));
  };

  const handleDynamicPricingChange = (field, value) => {
    setDynamicPricing(prev => ({ ...prev, [field]: value }));
  };

  const handleMaintenanceChange = (field, value) => {
    setMaintenance(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!basicInfo.courtName || basicInfo.courtName.trim() === '') {
        alert('Court Name is required. Please enter a value.');
        setLoading(false);
        return;
      }

      if (!pricing.pricePerHour || pricing.pricePerHour <= 0) {
        alert('Price per hour is required and must be greater than 0.');
        setLoading(false);
        return;
      }

      if (!pricing.minBookingDuration || pricing.minBookingDuration <= 0) {
        alert('Minimum booking duration is required and must be greater than 0.');
        setLoading(false);
        return;
      }

      if (!pricing.maxBookingDuration || pricing.maxBookingDuration <= 0) {
        alert('Maximum booking duration is required and must be greater than 0.');
        setLoading(false);
        return;
      }

      if (pricing.minBookingDuration > pricing.maxBookingDuration) {
        alert('Minimum booking duration cannot be greater than maximum booking duration.');
        setLoading(false);
        return;
      }

      // Prepare court data for backend
      const courtData = {
        courtName: basicInfo.courtName,
        type: basicInfo.type,
        capacity: basicInfo.capacity,
        pricePerHour: pricing.pricePerHour,
        description: basicInfo.description,
        venueId: venueId || user?.venueId,
        // Court features
        isIndoor: basicInfo.isIndoor,
        isLighted: basicInfo.isLighted,
        isAirConditioned: basicInfo.isAirConditioned,
        // Booking duration constraints
        minBookingDuration: pricing.minBookingDuration,
        maxBookingDuration: pricing.maxBookingDuration,
        // Operating hours
        openingTime: operatingHours.openingTime,
        closingTime: operatingHours.closingTime,
        slotDurationMinutes: operatingHours.slotDurationMinutes,
        isActiveOnWeekends: operatingHours.isActiveOnWeekends,
        isActiveOnHolidays: operatingHours.isActiveOnHolidays,
        // Break time
        hasBreakTime: breakTime.hasBreakTime,
        breakStartTime: breakTime.hasBreakTime ? breakTime.breakStartTime : null,
        breakEndTime: breakTime.hasBreakTime ? breakTime.breakEndTime : null,
        // Dynamic pricing
        dynamicPricingEnabled: dynamicPricing.dynamicPricingEnabled,
        peakHourStart: dynamicPricing.dynamicPricingEnabled ? dynamicPricing.peakHourStart : null,
        peakHourEnd: dynamicPricing.dynamicPricingEnabled ? dynamicPricing.peakHourEnd : null,
        peakHourMultiplier: dynamicPricing.dynamicPricingEnabled ? dynamicPricing.peakHourMultiplier : null,
        offPeakMultiplier: dynamicPricing.dynamicPricingEnabled ? dynamicPricing.offPeakMultiplier : null,
        weekendMultiplier: dynamicPricing.dynamicPricingEnabled ? dynamicPricing.weekendMultiplier : null,
        // Maintenance
        maintenanceMode: maintenance.maintenanceMode,
        maintenanceStartTime: maintenance.maintenanceMode ? maintenance.maintenanceStartTime : null,
        maintenanceEndTime: maintenance.maintenanceMode ? maintenance.maintenanceEndTime : null
      };

      console.log("Creating court:", courtData);
      
      // Make API call to create court
      await api.createCourt(courtData);
      console.log("Court created successfully");
      
      alert("Court created successfully!");
      navigate("/venues");
    } catch (error) {
      console.error("Error creating court:", error);
      alert("Failed to create court. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', name: 'Basic Information', icon: MapPinIcon },
    { id: 'pricing', name: 'Pricing & Duration', icon: CurrencyDollarIcon },
    { id: 'hours', name: 'Operating Hours', icon: ClockIcon },
    { id: 'pricing-dynamic', name: 'Dynamic Pricing', icon: CogIcon },
    { id: 'maintenance', name: 'Maintenance', icon: CogIcon }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  required
                  value={basicInfo.courtName}
                  onChange={(e) => handleBasicInfoChange('courtName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Court A, Main Court"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport Type *
                </label>
                <select
                  required
                  value={basicInfo.type}
                  onChange={(e) => handleBasicInfoChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="BASKETBALL">Basketball</option>
                  <option value="FUTSAL">Futsal</option>
                  <option value="BADMINTON">Badminton</option>
                  <option value="TENNIS">Tennis</option>
                  <option value="CRICKET">Cricket</option>
                  <option value="MULTI_SPORT">Multi-Sport</option>
                  <option value="VOLLEYBALL">Volleyball</option>
                  <option value="SOCCER">Soccer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={basicInfo.capacity}
                  onChange={(e) => handleBasicInfoChange('capacity', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Maximum number of players"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={basicInfo.description}
                  onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe the court, surface, features..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Court Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isIndoor"
                    checked={basicInfo.isIndoor}
                    onChange={(e) => handleBasicInfoChange('isIndoor', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isIndoor" className="ml-3 text-sm font-medium text-gray-700">
                    Indoor Court
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isLighted"
                    checked={basicInfo.isLighted}
                    onChange={(e) => handleBasicInfoChange('isLighted', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isLighted" className="ml-3 text-sm font-medium text-gray-700">
                    <LightBulbIcon className="h-4 w-4 inline mr-1" />
                    Lighted
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAirConditioned"
                    checked={basicInfo.isAirConditioned}
                    onChange={(e) => handleBasicInfoChange('isAirConditioned', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAirConditioned" className="ml-3 text-sm font-medium text-gray-700">
                    <CloudIcon className="h-4 w-4 inline mr-1" />
                    Air Conditioned
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Hour (LKR) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={pricing.pricePerHour}
                  onChange={(e) => handlePricingChange('pricePerHour', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="800.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Booking Duration (Hours) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={pricing.minBookingDuration}
                  onChange={(e) => handlePricingChange('minBookingDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Booking Duration (Hours) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={pricing.maxBookingDuration}
                onChange={(e) => handlePricingChange('maxBookingDuration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="4"
              />
            </div>
          </div>
        );

      case 'hours':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Time *
                </label>
                <input
                  type="time"
                  required
                  value={operatingHours.openingTime}
                  onChange={(e) => handleOperatingHoursChange('openingTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Closing Time *
                </label>
                <input
                  type="time"
                  required
                  value={operatingHours.closingTime}
                  onChange={(e) => handleOperatingHoursChange('closingTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slot Duration (Minutes)
                </label>
                <select
                  value={operatingHours.slotDurationMinutes}
                  onChange={(e) => handleOperatingHoursChange('slotDurationMinutes', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActiveOnWeekends"
                    checked={operatingHours.isActiveOnWeekends}
                    onChange={(e) => handleOperatingHoursChange('isActiveOnWeekends', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActiveOnWeekends" className="ml-3 text-sm font-medium text-gray-700">
                    Active on Weekends
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActiveOnHolidays"
                    checked={operatingHours.isActiveOnHolidays}
                    onChange={(e) => handleOperatingHoursChange('isActiveOnHolidays', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActiveOnHolidays" className="ml-3 text-sm font-medium text-gray-700">
                    Active on Holidays
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasBreakTime"
                  checked={breakTime.hasBreakTime}
                  onChange={(e) => handleBreakTimeChange('hasBreakTime', e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="hasBreakTime" className="ml-3 text-sm font-medium text-gray-700">
                  Has Break Time (e.g., lunch break)
                </label>
              </div>
              
              {breakTime.hasBreakTime && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Break Start Time
                    </label>
                    <input
                      type="time"
                      value={breakTime.breakStartTime}
                      onChange={(e) => handleBreakTimeChange('breakStartTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Break End Time
                    </label>
                    <input
                      type="time"
                      value={breakTime.breakEndTime}
                      onChange={(e) => handleBreakTimeChange('breakEndTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'pricing-dynamic':
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peak Hour Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      value={dynamicPricing.peakHourMultiplier}
                      onChange={(e) => handleDynamicPricingChange('peakHourMultiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="1.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Off-Peak Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="1.0"
                      value={dynamicPricing.offPeakMultiplier}
                      onChange={(e) => handleDynamicPricingChange('offPeakMultiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0.8"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weekend Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      value={dynamicPricing.weekendMultiplier}
                      onChange={(e) => handleDynamicPricingChange('weekendMultiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="1.2"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'maintenance':
        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={maintenance.maintenanceMode}
                onChange={(e) => handleMaintenanceChange('maintenanceMode', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenanceMode" className="ml-3 text-sm font-medium text-gray-700">
                Set Maintenance Mode
              </label>
            </div>

            {maintenance.maintenanceMode && (
              <div className="space-y-6 pl-6 border-l-2 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Start Time
                    </label>
                    <input
                      type="time"
                      value={maintenance.maintenanceStartTime}
                      onChange={(e) => handleMaintenanceChange('maintenanceStartTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance End Time
                    </label>
                    <input
                      type="time"
                      value={maintenance.maintenanceEndTime}
                      onChange={(e) => handleMaintenanceChange('maintenanceEndTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CogIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> When maintenance mode is enabled, the court will not be available for bookings during the specified time period.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!venueId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading venue information...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Add New Court</h1>
              <p className="text-gray-600 mt-2">Create a new sports court for your venue</p>
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
                  {loading ? 'Creating...' : 'Create Court'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
