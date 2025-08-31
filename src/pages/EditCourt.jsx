import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeftIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CogIcon,
  MapPinIcon,
  CloudIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function EditCourt() {
  const navigate = useNavigate();
  const { courtId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
    if (courtId) {
      fetchCourtData();
    }
  }, [courtId]);

  const fetchCourtData = async () => {
    try {
      setFetching(true);
      const courtData = await api.getCourtById(courtId);
      
      console.log('=== DEBUG: Court Data Received ===');
      console.log('Raw courtData:', courtData);
      console.log('courtData.courtName:', courtData?.courtName);
      console.log('courtData.type:', courtData?.type);
      console.log('courtData.capacity:', courtData?.capacity);
      console.log('===============================');
      
      // Populate form with existing court data
      setBasicInfo({
        courtName: courtData.courtName || '',
        type: courtData.type || 'BASKETBALL',
        capacity: courtData.capacity || 10,
        description: courtData.description || '',
        isIndoor: courtData.isIndoor !== undefined ? courtData.isIndoor : true,
        isLighted: courtData.isLighted || false,
        isAirConditioned: courtData.isAirConditioned || false
      });

      setPricing({
        pricePerHour: courtData.pricePerHour || 0.0,
        minBookingDuration: courtData.minBookingDuration || 1,
        maxBookingDuration: courtData.maxBookingDuration || 4
      });

      setOperatingHours({
        openingTime: courtData.openingTime || '06:00',
        closingTime: courtData.closingTime || '23:00',
        slotDurationMinutes: courtData.slotDurationMinutes || 30,
        isActiveOnWeekends: courtData.isActiveOnWeekends !== undefined ? courtData.isActiveOnWeekends : true,
        isActiveOnHolidays: courtData.isActiveOnHolidays || false
      });

      setBreakTime({
        hasBreakTime: courtData.hasBreakTime || false,
        breakStartTime: courtData.breakStartTime || '12:00',
        breakEndTime: courtData.breakEndTime || '13:00'
      });

      setDynamicPricing({
        dynamicPricingEnabled: courtData.dynamicPricingEnabled || false,
        peakHourStart: courtData.peakHourStart || '18:00',
        peakHourEnd: courtData.peakHourEnd || '22:00',
        peakHourMultiplier: courtData.peakHourMultiplier || 1.5,
        offPeakMultiplier: courtData.offPeakMultiplier || 0.8,
        weekendMultiplier: courtData.weekendMultiplier || 1.2
      });

      setMaintenance({
        maintenanceMode: courtData.maintenanceMode || false,
        maintenanceStartTime: courtData.maintenanceStartTime || '00:00',
        maintenanceEndTime: courtData.maintenanceEndTime || '06:00'
      });

    } catch (error) {
      console.error("Error fetching court data:", error);
      alert("Failed to fetch court data. Please try again.");
    } finally {
      setFetching(false);
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
      // First, we need to get the venue ID for the current user
      let venueId = null;
      try {
        const venues = await api.getVenues();
        if (venues && venues.length > 0) {
          venueId = venues[0].venueId; // Get the first venue (each owner has only one)
        }
      } catch (error) {
        console.error("Error fetching venue:", error);
        alert("Failed to fetch venue information. Please try again.");
        setLoading(false);
        return;
      }

      if (!venueId) {
        alert("No venue found for the current user. Please create a venue first.");
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
        venueId: venueId, // This is the required field that was missing!
        // Additional fields that can be added later
        isIndoor: basicInfo.isIndoor,
        isLighted: basicInfo.isLighted,
        isAirConditioned: basicInfo.isAirConditioned,
        minBookingDuration: pricing.minBookingDuration,
        maxBookingDuration: pricing.maxBookingDuration,
        openingTime: operatingHours.openingTime,
        closingTime: operatingHours.closingTime,
        slotDurationMinutes: operatingHours.slotDurationMinutes,
        isActiveOnWeekends: operatingHours.isActiveOnWeekends,
        isActiveOnHolidays: operatingHours.isActiveOnHolidays,
        hasBreakTime: breakTime.hasBreakTime,
        breakStartTime: breakTime.hasBreakTime ? breakTime.breakStartTime : null,
        breakEndTime: breakTime.hasBreakTime ? breakTime.breakEndTime : null,
        dynamicPricingEnabled: dynamicPricing.dynamicPricingEnabled,
        peakHourStart: dynamicPricing.dynamicPricingEnabled ? dynamicPricing.peakHourStart : null,
        peakHourEnd: dynamicPricing.dynamicPricingEnabled ? dynamicPricing.peakHourEnd : null,
        peakHourMultiplier: dynamicPricing.dynamicPricingEnabled ? dynamicPricing.peakHourMultiplier : null,
        offPeakMultiplier: dynamicPricing.dynamicPricingEnabled ? dynamicPricing.offPeakMultiplier : null,
        weekendMultiplier: dynamicPricing.dynamicPricingEnabled ? dynamicPricing.weekendMultiplier : null,
        maintenanceMode: maintenance.maintenanceMode,
        maintenanceStartTime: maintenance.maintenanceMode ? maintenance.maintenanceStartTime : null,
        maintenanceEndTime: maintenance.maintenanceMode ? maintenance.maintenanceEndTime : null
      };

      console.log("Updating court:", courtData);
      
      // Make API call to update court
      await api.updateCourt(courtId, courtData);
      console.log("Court updated successfully");
      
      alert("Court updated successfully!");
      navigate("/venues");
    } catch (error) {
      console.error("Error updating court:", error);
      alert("Failed to update court. Please try again.");
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
                  Minimum Booking Duration (Hours)
                </label>
                <input
                  type="number"
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
                Maximum Booking Duration (Hours)
              </label>
              <input
                type="number"
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

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading court information...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Edit Court</h1>
              <p className="text-gray-600 mt-2">Update your sports court details</p>
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
                  {loading ? 'Updating...' : 'Update Court'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
