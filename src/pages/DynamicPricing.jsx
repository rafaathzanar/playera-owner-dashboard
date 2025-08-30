import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/outline";

export default function DynamicPricing() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [venue, setVenue] = useState(null);
  const [courts, setCourts] = useState([]);
  const [showVenuePricingModal, setShowVenuePricingModal] = useState(false);
  const [showCourtPricingModal, setShowCourtPricingModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [activeTab, setActiveTab] = useState('venue');

  // Venue pricing form
  const [venuePricingForm, setVenuePricingForm] = useState({
    dynamicPricingEnabled: false,
    basePrice: '',
    peakHourMultiplier: 1.5,
    offPeakMultiplier: 0.8,
    weekendMultiplier: 1.2,
    holidayMultiplier: 1.3,
    peakHourStart: '18:00',
    peakHourEnd: '22:00',
    specialEventMultiplier: 1.5,
    seasonalPricing: false,
    summerMultiplier: 1.1,
    winterMultiplier: 0.9
  });

  // Court pricing form
  const [courtPricingForm, setCourtPricingForm] = useState({
    dynamicPricingEnabled: false,
    basePrice: '',
    peakHourMultiplier: 1.5,
    offPeakMultiplier: 0.8,
    weekendMultiplier: 1.2,
    peakHourStart: '18:00',
    peakHourEnd: '22:00',
    maintenanceMode: false,
    maintenanceMultiplier: 0.0
  });

  useEffect(() => {
    fetchVenueAndData();
  }, [venueId]);

  const fetchVenueAndData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with real API calls
      // const venueData = await api.getVenueById(venueId);
      // const courtsData = await api.getCourtsByVenue(venueId);
      
      // Mock data for now
      setVenue({
        name: 'Colombo Indoor Sports Complex',
        venueId: venueId,
        basePrice: 800,
        dynamicPricingEnabled: true,
        peakHourMultiplier: 1.5,
        offPeakMultiplier: 0.8,
        weekendMultiplier: 1.2,
        holidayMultiplier: 1.3,
        peakHourStart: '18:00',
        peakHourEnd: '22:00'
      });
      
      setCourts([
        {
          courtId: 1,
          courtName: 'Basketball Court 1',
          type: 'BASKETBALL',
          pricePerHour: 1200,
          dynamicPricingEnabled: true,
          peakHourMultiplier: 1.5,
          offPeakMultiplier: 0.8,
          weekendMultiplier: 1.2,
          peakHourStart: '18:00',
          peakHourEnd: '22:00',
          maintenanceMode: false
        },
        {
          courtId: 2,
          courtName: 'Futsal Court 1',
          type: 'FUTSAL',
          pricePerHour: 1000,
          dynamicPricingEnabled: true,
          peakHourMultiplier: 1.4,
          offPeakMultiplier: 0.8,
          weekendMultiplier: 1.2,
          peakHourStart: '18:00',
          peakHourEnd: '22:00',
          maintenanceMode: false
        },
        {
          courtId: 3,
          courtName: 'Badminton Court 1',
          type: 'BADMINTON',
          pricePerHour: 800,
          dynamicPricingEnabled: false,
          peakHourMultiplier: 1.0,
          offPeakMultiplier: 1.0,
          weekendMultiplier: 1.0,
          peakHourStart: '18:00',
          peakHourEnd: '22:00',
          maintenanceMode: false
        }
      ]);
    } catch (error) {
      console.error('Error fetching venue and data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVenuePricingSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with real API call
      // await api.updateVenuePricing(venueId, venuePricingForm);
      
      // Update local state
      setVenue(prev => ({ ...prev, ...venuePricingForm }));
      setShowVenuePricingModal(false);
    } catch (error) {
      console.error('Error updating venue pricing:', error);
    }
  };

  const handleCourtPricingSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with real API call
      // await api.updateCourtPricing(editingCourt.courtId, courtPricingForm);
      
      // Update local state
      setCourts(prev => prev.map(court => 
        court.courtId === editingCourt.courtId 
          ? { ...court, ...courtPricingForm }
          : court
      ));
      
      setShowCourtPricingModal(false);
      setEditingCourt(null);
    } catch (error) {
      console.error('Error updating court pricing:', error);
    }
  };

  const openCourtPricingModal = (court) => {
    setEditingCourt(court);
    setCourtPricingForm({
      dynamicPricingEnabled: court.dynamicPricingEnabled,
      basePrice: court.pricePerHour,
      peakHourMultiplier: court.peakHourMultiplier,
      offPeakMultiplier: court.offPeakMultiplier,
      weekendMultiplier: court.weekendMultiplier,
      peakHourStart: court.peakHourStart,
      peakHourEnd: court.peakHourEnd,
      maintenanceMode: court.maintenanceMode,
      maintenanceMultiplier: 0.0
    });
    setShowCourtPricingModal(true);
  };

  const calculatePrice = (basePrice, multiplier) => {
    return (basePrice * multiplier).toFixed(2);
  };

  const getMultiplierColor = (multiplier) => {
    if (multiplier > 1.0) return 'text-red-600';
    if (multiplier < 1.0) return 'text-green-600';
    return 'text-gray-600';
  };

  const PricingModal = ({ isOpen, onClose, onSubmit, title, submitText, isVenue = false }) => {
    if (!isOpen) return null;

    const form = isVenue ? venuePricingForm : courtPricingForm;
    const setForm = isVenue ? setVenuePricingForm : setCourtPricingForm;

    const handleInputChange = (field, value) => {
      setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Basic Settings */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CogIcon className="w-5 h-5 mr-2" />
                Basic Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.dynamicPricingEnabled}
                      onChange={(e) => handleInputChange('dynamicPricingEnabled', e.target.checked)}
                      className="mr-2"
                    />
                    Enable Dynamic Pricing
                  </label>
                </div>

                {!isVenue && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Price per Hour (LKR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.basePrice}
                      onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Time-based Pricing */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Time-based Pricing
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peak Hour Start
                  </label>
                  <input
                    type="time"
                    value={form.peakHourStart}
                    onChange={(e) => handleInputChange('peakHourStart', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peak Hour End
                  </label>
                  <input
                    type="time"
                    value={form.peakHourEnd}
                    onChange={(e) => handleInputChange('peakHourEnd', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peak Hour Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    value={form.peakHourMultiplier}
                    onChange={(e) => handleInputChange('peakHourMultiplier', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Price: LKR {calculatePrice(isVenue ? venue?.basePrice : form.basePrice, form.peakHourMultiplier)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Off-Peak Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={form.offPeakMultiplier}
                    onChange={(e) => handleInputChange('offPeakMultiplier', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Price: LKR {calculatePrice(isVenue ? venue?.basePrice : form.basePrice, form.offPeakMultiplier)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weekend Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    value={form.weekendMultiplier}
                    onChange={(e) => handleInputChange('weekendMultiplier', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Price: LKR {calculatePrice(isVenue ? venue?.basePrice : form.basePrice, form.weekendMultiplier)}
                  </p>
                </div>
              </div>
            </div>

            {/* Special Pricing */}
            {isVenue && (
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Special Pricing
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Holiday Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      value={form.holidayMultiplier}
                      onChange={(e) => handleInputChange('holidayMultiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Price: LKR {calculatePrice(venue?.basePrice, form.holidayMultiplier)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Event Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      value={form.specialEventMultiplier}
                      onChange={(e) => handleInputChange('specialEventMultiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Price: LKR {calculatePrice(venue?.basePrice, form.specialEventMultiplier)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.seasonalPricing}
                      onChange={(e) => handleInputChange('seasonalPricing', e.target.checked)}
                      className="mr-2"
                    />
                    Enable Seasonal Pricing
                  </label>
                </div>

                {form.seasonalPricing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Summer Multiplier
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        value={form.summerMultiplier}
                        onChange={(e) => handleInputChange('summerMultiplier', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Winter Multiplier
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        value={form.winterMultiplier}
                        onChange={(e) => handleInputChange('winterMultiplier', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Court-specific Settings */}
            {!isVenue && (
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
                  Court Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={form.maintenanceMode}
                        onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                        className="mr-2"
                      />
                      Maintenance Mode
                    </label>
                  </div>

                  {form.maintenanceMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maintenance Multiplier
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.0"
                        max="1.0"
                        value={form.maintenanceMultiplier}
                        onChange={(e) => handleInputChange('maintenanceMultiplier', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Price: LKR {calculatePrice(form.basePrice, form.maintenanceMultiplier)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                {submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dynamic Pricing</h1>
              <p className="text-gray-600 mt-2">
                Configure pricing rules and multipliers for {venue?.name}
              </p>
            </div>
            <button
              onClick={() => setShowVenuePricingModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center"
            >
              <CogIcon className="w-5 h-5 mr-2" />
              Configure Venue Pricing
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('venue')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'venue'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Venue Pricing
            </button>
            <button
              onClick={() => setActiveTab('courts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courts'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Court Pricing
            </button>
          </nav>
        </div>

        {/* Venue Pricing Tab */}
        {activeTab === 'venue' && (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Venue-wide Pricing Rules</h2>
            </div>
            <div className="p-6">
              {venue?.dynamicPricingEnabled ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {venue.peakHourMultiplier}x
                    </div>
                    <div className="text-sm text-green-800">Peak Hours</div>
                    <div className="text-xs text-green-600">
                      {venue.peakHourStart} - {venue.peakHourEnd}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {venue.offPeakMultiplier}x
                    </div>
                    <div className="text-sm text-blue-800">Off-Peak Hours</div>
                    <div className="text-xs text-blue-600">All other times</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {venue.weekendMultiplier}x
                    </div>
                    <div className="text-sm text-purple-800">Weekends</div>
                    <div className="text-xs text-purple-600">Saturday & Sunday</div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {venue.holidayMultiplier}x
                    </div>
                    <div className="text-sm text-orange-800">Holidays</div>
                    <div className="text-xs text-orange-600">Public holidays</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Dynamic pricing disabled</h3>
                  <p className="text-gray-600 mb-4">Enable dynamic pricing to set different rates for different times.</p>
                  <button
                    onClick={() => setShowVenuePricingModal(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
                  >
                    Enable Dynamic Pricing
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Court Pricing Tab */}
        {activeTab === 'courts' && (
          <div className="space-y-6">
            {courts.map((court) => (
              <div key={court.courtId} className="bg-white rounded-lg shadow border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{court.courtName}</h3>
                      <p className="text-sm text-gray-600 capitalize">{court.type.toLowerCase()}</p>
                    </div>
                    <button
                      onClick={() => openCourtPricingModal(court)}
                      className="text-blue-600 hover:text-blue-700 p-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {court.dynamicPricingEnabled ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {court.peakHourMultiplier}x
                        </div>
                        <div className="text-sm text-green-800">Peak Hours</div>
                        <div className="text-xs text-green-600">
                          {court.peakHourStart} - {court.peakHourEnd}
                        </div>
                        <div className="text-lg font-semibold text-green-800 mt-2">
                          LKR {calculatePrice(court.pricePerHour, court.peakHourMultiplier)}
                        </div>
                      </div>

                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {court.offPeakMultiplier}x
                        </div>
                        <div className="text-sm text-blue-800">Off-Peak Hours</div>
                        <div className="text-xs text-blue-600">All other times</div>
                        <div className="text-lg font-semibold text-blue-800 mt-2">
                          LKR {calculatePrice(court.pricePerHour, court.offPeakMultiplier)}
                        </div>
                      </div>

                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                          {court.weekendMultiplier}x
                        </div>
                        <div className="text-sm text-purple-800">Weekends</div>
                        <div className="text-xs text-purple-600">Saturday & Sunday</div>
                        <div className="text-lg font-semibold text-purple-800 mt-2">
                          LKR {calculatePrice(court.pricePerHour, court.weekendMultiplier)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        LKR {court.pricePerHour}/hour
                      </div>
                      <p className="text-gray-600">Fixed pricing - no dynamic rules applied</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Venue Pricing Modal */}
      <PricingModal
        isOpen={showVenuePricingModal}
        onClose={() => setShowVenuePricingModal(false)}
        onSubmit={handleVenuePricingSubmit}
        title="Configure Venue Pricing"
        submitText="Update Pricing"
        isVenue={true}
      />

      {/* Court Pricing Modal */}
      <PricingModal
        isOpen={showCourtPricingModal}
        onClose={() => {
          setShowCourtPricingModal(false);
          setEditingCourt(null);
        }}
        onSubmit={handleCourtPricingSubmit}
        title="Configure Court Pricing"
        submitText="Update Pricing"
        isVenue={false}
      />
    </div>
  );
}

