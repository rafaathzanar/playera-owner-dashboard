import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CurrencyDollarIcon,
  ClockIcon,
  CogIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function DynamicPricing() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [venue, setVenue] = useState(null);
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Form state for dynamic pricing settings
  const [pricingForm, setPricingForm] = useState({
    dynamicPricingEnabled: false,
    peakHourStart: '18:00',
    peakHourEnd: '22:00',
    peakHourMultiplier: 1.5,
    offPeakMultiplier: 0.8,
    weekendMultiplier: 1.2
  });

  useEffect(() => {
    fetchCourts();
  }, [venueId]);

  useEffect(() => {
    if (selectedCourt) {
      initializePricingForm();
    }
  }, [selectedCourt]);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.userId) {
        console.error('User not authenticated');
        setVenue(null);
        setCourts([]);
        return;
      }

      // Fetch venue data first
      const venueData = await api.getVenueByOwner(user.userId);
      console.log('Venue data received:', venueData);
      
      if (venueData && venueData.venueId) {
        setVenue(venueData);
        
        // Fetch courts for this venue
        const courtsData = await api.getCourtsByVenue(venueData.venueId);
        console.log('Courts data received:', courtsData);
        
        if (courtsData && Array.isArray(courtsData)) {
          setCourts(courtsData);
          if (courtsData.length > 0) {
            setSelectedCourt(courtsData[0]);
          }
        } else {
          setCourts([]);
        }
      } else {
        console.log('No venue data or invalid venue ID:', venueData);
        setVenue(null);
        setCourts([]);
      }
    } catch (err) {
      setError('Failed to fetch courts');
      console.error('Error fetching courts:', err);
      setVenue(null);
      setCourts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPricingSettings = async (courtId) => {
    try {
      const currentSettings = await api.getDynamicPricingSettings(courtId);
      setPricingForm({
        dynamicPricingEnabled: currentSettings.dynamicPricingEnabled || false,
        peakHourStart: currentSettings.peakHourStart || '18:00',
        peakHourEnd: currentSettings.peakHourEnd || '22:00',
        peakHourMultiplier: currentSettings.peakHourMultiplier || 1.5,
        offPeakMultiplier: currentSettings.offPeakMultiplier || 0.8,
        weekendMultiplier: currentSettings.weekendMultiplier || 1.2
      });
    } catch (err) {
      console.error('Error fetching current pricing settings:', err);
      // Keep current form state, don't show alert to avoid spam
    }
  };

  const initializePricingForm = () => {
    if (selectedCourt) {
      setPricingForm({
        dynamicPricingEnabled: selectedCourt.dynamicPricingEnabled || false,
        peakHourStart: selectedCourt.peakHourStart || '18:00',
        peakHourEnd: selectedCourt.peakHourEnd || '22:00',
        peakHourMultiplier: selectedCourt.peakHourMultiplier || 1.5,
        offPeakMultiplier: selectedCourt.offPeakMultiplier || 0.8,
        weekendMultiplier: selectedCourt.weekendMultiplier || 1.2
      });
      
      // Also fetch the latest settings from backend
      fetchCurrentPricingSettings(selectedCourt.courtId);
    }
  };

  const handleUpdatePricing = async () => {
    try {
      setLoading(true);
      const response = await api.updateDynamicPricing(selectedCourt.courtId, pricingForm);
      
      // Check if the response indicates success
      if (response && response.success) {
        setShowSettingsModal(false);
        alert(response.message || 'Dynamic pricing settings updated successfully');
        
        // Refresh court data and pricing form
        await fetchCourts();
        if (selectedCourt) {
          await fetchCurrentPricingSettings(selectedCourt.courtId);
        }
      } else {
        // Handle unsuccessful response
        const errorMessage = response?.message || 'Failed to update pricing settings';
        alert(errorMessage);
      }
    } catch (err) {
      console.error('Error updating pricing settings:', err);
      
      // Show more specific error message
      let errorMessage = 'Failed to update pricing settings';
      if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculatePriceExample = (basePrice, time, isWeekend) => {
    if (!pricingForm.dynamicPricingEnabled) return basePrice;

    let multiplier = 1.0;
    const hour = parseInt(time.split(':')[0]);

    // Peak hour pricing
    if (hour >= 18 && hour < 22) {
      multiplier *= pricingForm.peakHourMultiplier;
    } else {
      multiplier *= pricingForm.offPeakMultiplier;
    }

    // Weekend pricing
    if (isWeekend) {
      multiplier *= pricingForm.weekendMultiplier;
    }

    return (basePrice * multiplier).toFixed(2);
  };

  // Calculate real-time pricing examples based on current settings
  const getRealTimePricingExamples = () => {
    if (!selectedCourt || !pricingForm.dynamicPricingEnabled) {
      return {
        weekdayOffPeak: selectedCourt?.pricePerHour || 0,
        weekdayPeak: selectedCourt?.pricePerHour || 0,
        weekdayLate: selectedCourt?.pricePerHour || 0,
        weekendOffPeak: selectedCourt?.pricePerHour || 0,
        weekendPeak: selectedCourt?.pricePerHour || 0,
        weekendAfternoon: selectedCourt?.pricePerHour || 0
      };
    }

    const basePrice = selectedCourt.pricePerHour || 0;

    return {
      weekdayOffPeak: (basePrice * pricingForm.offPeakMultiplier).toFixed(2),
      weekdayPeak: (basePrice * pricingForm.peakHourMultiplier).toFixed(2),
      weekdayLate: (basePrice * pricingForm.offPeakMultiplier).toFixed(2),
      weekendOffPeak: (basePrice * pricingForm.offPeakMultiplier * pricingForm.weekendMultiplier).toFixed(2),
      weekendPeak: (basePrice * pricingForm.peakHourMultiplier * pricingForm.weekendMultiplier).toFixed(2),
      weekendAfternoon: (basePrice * pricingForm.offPeakMultiplier * pricingForm.weekendMultiplier).toFixed(2)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dynamic pricing...</p>
        </div>
      </div>
    );
  }

  // Show onboarding state if no venue found
  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <PlusIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your First Venue</h3>
          <p className="text-gray-600 mb-6">
            Before you can manage dynamic pricing, you need to create a venue first. This will be your sports facility where customers can book courts and equipment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/add-venue')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Venue
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding state if no courts found
  if (courts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <PlusIcon className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Your First Court</h3>
          <p className="text-gray-600 mb-6">
            Before you can manage dynamic pricing, you need to add courts to your venue. Dynamic pricing rules are applied to individual courts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/courts')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Court
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">!</span>
                </div>
          <p className="text-lg text-red-600">{error}</p>
          <button onClick={fetchCourts} className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Retry
              </button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dynamic Pricing Management</h1>
              <p className="text-gray-600 mt-2">
            Configure dynamic pricing rules to maximize revenue based on demand, time, and special events
              </p>
            </div>

        {/* Court Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select Court</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courts.map((court) => (
            <button
                key={court.courtId}
                onClick={() => setSelectedCourt(court)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedCourt?.courtId === court.courtId
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-medium text-gray-900">{court.courtName}</h3>
                <p className="text-sm text-gray-600">{court.type}</p>
                <p className="text-sm text-gray-600">Base: ${court.pricePerHour}/hour</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    court.dynamicPricingEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {court.dynamicPricingEnabled ? 'Dynamic Pricing Enabled' : 'Standard Pricing'}
                  </span>
                </div>
            </button>
            ))}
          </div>
        </div>

        {selectedCourt && (
          <>
            {/* Current Pricing Overview */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {selectedCourt.courtName} - Pricing Overview
                </h2>
            <button
                  onClick={() => setShowSettingsModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                >
                  <CogIcon className="h-5 w-5 mr-2" />
                  Configure Pricing
            </button>
        </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Base Price */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <CurrencyDollarIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Base Price</h3>
                  <p className="text-2xl font-bold text-gray-900">${selectedCourt.pricePerHour}</p>
                  <p className="text-sm text-gray-600">per hour</p>
            </div>

                {/* Peak Hours */}
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <ClockIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Peak Hours</h3>
                  <p className="text-lg font-semibold text-orange-900">
                    {selectedCourt.peakHourStart || '18:00'} - {selectedCourt.peakHourEnd || '22:00'}
                  </p>
                  <p className="text-sm text-orange-600">
                    {selectedCourt.peakHourMultiplier ? `${selectedCourt.peakHourMultiplier}x` : '1.5x'} multiplier
                  </p>
                  {selectedCourt.dynamicPricingEnabled && (
                    <p className="text-xs font-medium text-orange-800 mt-1">
                      LKR {(selectedCourt.pricePerHour * (selectedCourt.peakHourMultiplier || 1.5)).toFixed(2)}/hour
                    </p>
                  )}
                  </div>

                {/* Weekend Pricing */}
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="h-8 w-8 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">W</span>
                    </div>
                  <h3 className="font-medium text-gray-900">Weekend Pricing</h3>
                  <p className="text-lg font-semibold text-blue-900">
                    {selectedCourt.weekendMultiplier ? `${selectedCourt.weekendMultiplier}x` : '1.2x'} multiplier
                  </p>
                  <p className="text-sm text-blue-600">Saturday & Sunday</p>
                  {selectedCourt.dynamicPricingEnabled && (
                    <p className="text-xs font-medium text-blue-800 mt-1">
                      LKR {(selectedCourt.pricePerHour * (selectedCourt.weekendMultiplier || 1.2)).toFixed(2)}/hour
                    </p>
                  )}
                  </div>
                    </div>
                  </div>

            {/* Pricing Examples */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Live Pricing Examples</h3>
              <p className="text-sm text-gray-600 mb-4">
                Based on current base price: <span className="font-semibold">LKR {selectedCourt.pricePerHour}/hour</span>
                {pricingForm.dynamicPricingEnabled && (
                  <span className="ml-2 text-green-600">• Dynamic pricing enabled</span>
                )}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weekday Examples */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Weekday Pricing</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">9:00 AM</span>
                        <p className="text-xs text-gray-500">Off-peak hours</p>
                    </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">LKR {getRealTimePricingExamples().weekdayOffPeak}</span>
                        <p className="text-xs text-gray-500">per hour</p>
                  </div>
                </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <div>
                        <span className="font-medium text-orange-900">7:00 PM</span>
                        <p className="text-xs text-orange-600">Peak hours ({pricingForm.peakHourMultiplier}x)</p>
                </div>
                      <div className="text-right">
                        <span className="font-semibold text-orange-900">LKR {getRealTimePricingExamples().weekdayPeak}</span>
                        <p className="text-xs text-orange-600">per hour</p>
            </div>
          </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                        <span className="font-medium text-gray-900">10:00 PM</span>
                        <p className="text-xs text-gray-500">Off-peak hours</p>
                    </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">LKR {getRealTimePricingExamples().weekdayLate}</span>
                        <p className="text-xs text-gray-500">per hour</p>
                  </div>
                </div>
                        </div>
                      </div>

                {/* Weekend Examples */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Weekend Pricing</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <span className="font-medium text-blue-900">10:00 AM</span>
                        <p className="text-xs text-blue-600">Off-peak + Weekend ({pricingForm.weekendMultiplier}x)</p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-blue-900">LKR {getRealTimePricingExamples().weekendOffPeak}</span>
                        <p className="text-xs text-blue-600">per hour</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div>
                        <span className="font-medium text-purple-900">8:00 PM</span>
                        <p className="text-xs text-purple-600">Peak + Weekend ({pricingForm.peakHourMultiplier}x × {pricingForm.weekendMultiplier}x)</p>
                        </div>
                      <div className="text-right">
                        <span className="font-semibold text-purple-900">LKR {getRealTimePricingExamples().weekendPeak}</span>
                        <p className="text-xs text-purple-600">per hour</p>
                        </div>
                      </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <span className="font-medium text-blue-900">2:00 PM</span>
                        <p className="text-xs text-blue-600">Off-peak + Weekend ({pricingForm.weekendMultiplier}x)</p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-blue-900">LKR {getRealTimePricingExamples().weekendAfternoon}</span>
                        <p className="text-xs text-blue-600">per hour</p>
                      </div>
                        </div>
                        </div>
                      </div>
                    </div>

              {/* Pricing Summary */}
              {pricingForm.dynamicPricingEnabled && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-900 mb-2">Dynamic Pricing Summary</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-green-700">Peak Hours:</span>
                      <span className="font-medium text-green-900 ml-2">{pricingForm.peakHourStart} - {pricingForm.peakHourEnd}</span>
                      </div>
                    <div>
                      <span className="text-green-700">Peak Multiplier:</span>
                      <span className="font-medium text-green-900 ml-2">{pricingForm.peakHourMultiplier}x</span>
                    </div>
                    <div>
                      <span className="text-green-700">Weekend Multiplier:</span>
                      <span className="font-medium text-green-900 ml-2">{pricingForm.weekendMultiplier}x</span>
                </div>
              </div>
          </div>
        )}
      </div>


          </>
        )}
      </div>

      {/* Dynamic Pricing Settings Modal */}
      {showSettingsModal && selectedCourt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Configure Dynamic Pricing</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Enable Dynamic Pricing */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="dynamicPricing"
                    checked={pricingForm.dynamicPricingEnabled}
                    onChange={(e) => setPricingForm({...pricingForm, dynamicPricingEnabled: e.target.checked})}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="dynamicPricing" className="ml-2 block text-sm text-gray-900">
                    Enable Dynamic Pricing
                  </label>
                </div>

                {pricingForm.dynamicPricingEnabled && (
                  <>
                    {/* Peak Hours */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Peak Hour Start</label>
                      <input
                        type="time"
                        value={pricingForm.peakHourStart}
                        onChange={(e) => setPricingForm({...pricingForm, peakHourStart: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Peak Hour End</label>
                      <input
                        type="time"
                        value={pricingForm.peakHourEnd}
                        onChange={(e) => setPricingForm({...pricingForm, peakHourEnd: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    {/* Multipliers */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Peak Hour Multiplier</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1.0"
                        max="3.0"
                        value={pricingForm.peakHourMultiplier}
                        onChange={(e) => setPricingForm({...pricingForm, peakHourMultiplier: parseFloat(e.target.value)})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">e.g., 1.5 = 50% increase</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Off-Peak Multiplier</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="1.0"
                        value={pricingForm.offPeakMultiplier}
                        onChange={(e) => setPricingForm({...pricingForm, offPeakMultiplier: parseFloat(e.target.value)})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">e.g., 0.8 = 20% discount</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weekend Multiplier</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1.0"
                        max="2.0"
                        value={pricingForm.weekendMultiplier}
                        onChange={(e) => setPricingForm({...pricingForm, weekendMultiplier: parseFloat(e.target.value)})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">e.g., 1.2 = 20% increase</p>
                    </div>

                    {/* Live Preview */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h6 className="font-medium text-blue-900 mb-2">Live Preview (Base: LKR {selectedCourt?.pricePerHour}/hour)</h6>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-blue-700">Peak Hour:</span>
                          <span className="font-medium text-blue-900 ml-1">LKR {(selectedCourt?.pricePerHour * pricingForm.peakHourMultiplier).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Off-Peak:</span>
                          <span className="font-medium text-blue-900 ml-1">LKR {(selectedCourt?.pricePerHour * pricingForm.offPeakMultiplier).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Weekend Peak:</span>
                          <span className="font-medium text-blue-900 ml-1">LKR {(selectedCourt?.pricePerHour * pricingForm.peakHourMultiplier * pricingForm.weekendMultiplier).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Weekend Off-Peak:</span>
                          <span className="font-medium text-blue-900 ml-1">LKR {(selectedCourt?.pricePerHour * pricingForm.offPeakMultiplier * pricingForm.weekendMultiplier).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePricing}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                >
                  Update Pricing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

