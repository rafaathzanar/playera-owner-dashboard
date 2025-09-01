import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CogIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function CourtManagement() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courts, setCourts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [venue, setVenue] = useState(null);

  // Court form state
  const [courtForm, setCourtForm] = useState({
    courtName: '',
    type: 'BASKETBALL',
    capacity: '',
    pricePerHour: '',
    description: '',
    isIndoor: true,
    isLighted: true,
    isAirConditioned: true,
    minBookingDuration: 1,
    maxBookingDuration: 4,
    status: 'ACTIVE',
    openingTime: '06:00',
    closingTime: '23:00',
    slotDurationMinutes: 30,
    isActiveOnWeekends: true,
    isActiveOnHolidays: true,
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '14:00',
    dynamicPricingEnabled: false,
    peakHourStart: '18:00',
    peakHourEnd: '22:00',
    peakHourMultiplier: 1.5,
    offPeakMultiplier: 0.8,
    weekendMultiplier: 1.2,
    maintenanceMode: false
  });

  const courtTypes = [
    'BASKETBALL', 'FOOTBALL', 'TENNIS', 'BADMINTON', 'VOLLEYBALL', 
    'FUTSAL', 'CRICKET', 'SWIMMING', 'GYM', 'YOGA', 'DANCE', 'OTHER'
  ];

  useEffect(() => {
    fetchVenueAndCourts();
  }, [venueId]);

  const fetchVenueAndCourts = async () => {
    try {
      setLoading(true);
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
        setVenue({
          name: venueData.name || 'Sports Venue',
          venueId: venueData.venueId
        });

        // Fetch real courts from backend
        const courtsData = await api.getCourtsByVenue(venueData.venueId);
        console.log('Courts data received:', courtsData);
        
        if (courtsData && Array.isArray(courtsData)) {
          setCourts(courtsData);
        } else {
          console.log('No courts data or invalid format:', courtsData);
          setCourts([]);
        }
      } else {
        console.log('No venue data or invalid venue ID:', venueData);
        setVenue(null);
        setCourts([]);
      }
          } catch (error) {
        console.error('Error fetching venue and courts:', error);
        setVenue(null);
        setCourts([]);
      } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCourtForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCourt = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with real API call when backend is ready
      // const newCourt = await api.createCourt(venue.venueId, courtForm);
      
      // For now, simulate adding a court
      const newCourt = {
        courtId: Date.now(),
        ...courtForm
      };
      
      setCourts(prev => [...prev, newCourt]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding court:', error);
    }
  };

  const handleEditCourt = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with real API call when backend is ready
      // await api.updateCourt(editingCourt.courtId, courtForm);
      
      // For now, simulate updating a court
      setCourts(prev => prev.map(court => 
        court.courtId === editingCourt.courtId 
          ? { ...court, ...courtForm }
          : court
      ));
      
      setShowEditModal(false);
      setEditingCourt(null);
      resetForm();
    } catch (error) {
      console.error('Error updating court:', error);
    }
  };

  const handleDeleteCourt = async (courtId) => {
    if (window.confirm('Are you sure you want to delete this court?')) {
      try {
        // TODO: Replace with real API call when backend is ready
        // await api.deleteCourt(courtId);
        
        // For now, simulate deleting a court
        setCourts(prev => prev.filter(court => court.courtId !== courtId));
      } catch (error) {
        console.error('Error deleting court:', error);
      }
    }
  };

  const openEditModal = (court) => {
    setEditingCourt(court);
    setCourtForm({
      courtName: court.courtName,
      type: court.type,
      capacity: court.capacity,
      pricePerHour: court.pricePerHour,
      description: court.description || '',
      isIndoor: court.isIndoor,
      isLighted: court.isLighted,
      isAirConditioned: court.isAirConditioned,
      minBookingDuration: court.minBookingDuration || 1,
      maxBookingDuration: court.maxBookingDuration || 4,
      status: court.status,
      openingTime: court.openingTime,
      closingTime: court.closingTime,
      slotDurationMinutes: court.slotDurationMinutes || 30,
      isActiveOnWeekends: court.isActiveOnWeekends,
      isActiveOnHolidays: court.isActiveOnHolidays,
      hasBreakTime: court.hasBreakTime || false,
      breakStartTime: court.breakStartTime || '12:00',
      breakEndTime: court.breakEndTime || '14:00',
      dynamicPricingEnabled: court.dynamicPricingEnabled,
      peakHourStart: court.peakHourStart || '18:00',
      peakHourEnd: court.peakHourEnd || '22:00',
      peakHourMultiplier: court.peakHourMultiplier || 1.5,
      offPeakMultiplier: court.offPeakMultiplier || 0.8,
      weekendMultiplier: court.weekendMultiplier || 1.2,
      maintenanceMode: court.maintenanceMode || false
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setCourtForm({
      courtName: '',
      type: 'BASKETBALL',
      capacity: '',
      pricePerHour: '',
      description: '',
      isIndoor: true,
      isLighted: true,
      isAirConditioned: true,
      minBookingDuration: 1,
      maxBookingDuration: 4,
      status: 'ACTIVE',
      openingTime: '06:00',
      closingTime: '23:00',
      slotDurationMinutes: 30,
      isActiveOnWeekends: true,
      isActiveOnHolidays: true,
      hasBreakTime: false,
      breakStartTime: '12:00',
      breakEndTime: '14:00',
      dynamicPricingEnabled: false,
      peakHourStart: '18:00',
      peakHourEnd: '22:00',
      peakHourMultiplier: 1.5,
      offPeakMultiplier: 0.8,
      weekendMultiplier: 1.2,
      maintenanceMode: false
    });
  };

  const CourtModal = ({ isOpen, onClose, onSubmit, title, submitText }) => {
    if (!isOpen) return null;

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
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  value={courtForm.courtName}
                  onChange={(e) => handleInputChange('courtName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Type *
                </label>
                <select
                  value={courtForm.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {courtTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  value={courtForm.capacity}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Hour (LKR) *
                </label>
                <input
                  type="number"
                  value={courtForm.pricePerHour}
                  onChange={(e) => handleInputChange('pricePerHour', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={courtForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Amenities */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={courtForm.isIndoor}
                  onChange={(e) => handleInputChange('isIndoor', e.target.checked)}
                  className="mr-2"
                />
                Indoor Court
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={courtForm.isLighted}
                  onChange={(e) => handleInputChange('isLighted', e.target.checked)}
                  className="mr-2"
                />
                Lighting Available
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={courtForm.isAirConditioned}
                  onChange={(e) => handleInputChange('isAirConditioned', e.target.checked)}
                  className="mr-2"
                />
                Air Conditioned
              </label>
            </div>

            {/* Time Management */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Time Management
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={courtForm.openingTime}
                    onChange={(e) => handleInputChange('openingTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={courtForm.closingTime}
                    onChange={(e) => handleInputChange('closingTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slot Duration (minutes)
                  </label>
                  <select
                    value={courtForm.slotDurationMinutes}
                    onChange={(e) => handleInputChange('slotDurationMinutes', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={courtForm.hasBreakTime}
                      onChange={(e) => handleInputChange('hasBreakTime', e.target.checked)}
                      className="mr-2"
                    />
                    Has Break Time
                  </label>
                  
                  {courtForm.hasBreakTime && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Break Start
                        </label>
                        <input
                          type="time"
                          value={courtForm.breakStartTime}
                          onChange={(e) => handleInputChange('breakStartTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Break End
                        </label>
                        <input
                          type="time"
                          value={courtForm.breakEndTime}
                          onChange={(e) => handleInputChange('breakEndTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={courtForm.isActiveOnWeekends}
                      onChange={(e) => handleInputChange('isActiveOnWeekends', e.target.checked)}
                      className="mr-2"
                    />
                    Active on Weekends
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={courtForm.isActiveOnHolidays}
                      onChange={(e) => handleInputChange('isActiveOnHolidays', e.target.checked)}
                      className="mr-2"
                    />
                    Active on Holidays
                  </label>
                </div>
              </div>
            </div>

            {/* Dynamic Pricing */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                Dynamic Pricing
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={courtForm.dynamicPricingEnabled}
                      onChange={(e) => handleInputChange('dynamicPricingEnabled', e.target.checked)}
                      className="mr-2"
                    />
                    Enable Dynamic Pricing
                  </label>
                </div>
              </div>

              {courtForm.dynamicPricingEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peak Hour Start
                    </label>
                    <input
                      type="time"
                      value={courtForm.peakHourStart}
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
                      value={courtForm.peakHourEnd}
                      onChange={(e) => handleInputChange('peakHourEnd', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peak Hour Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      value={courtForm.peakHourMultiplier}
                      onChange={(e) => handleInputChange('peakHourMultiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      value={courtForm.offPeakMultiplier}
                      onChange={(e) => handleInputChange('offPeakMultiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      value={courtForm.weekendMultiplier}
                      onChange={(e) => handleInputChange('weekendMultiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CogIcon className="w-5 h-5 mr-2" />
                Status & Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={courtForm.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={courtForm.maintenanceMode}
                      onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                      className="mr-2"
                    />
                    Maintenance Mode
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
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
            Before you can manage courts, you need to create a venue first. This will be your sports facility where customers can book courts and equipment.
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Court Management</h1>
              <p className="text-gray-600 mt-2">
                Manage courts for {venue?.name}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Court
            </button>
          </div>
        </div>

        {/* Courts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => (
            <div key={court.courtId} className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{court.courtName}</h3>
                    <p className="text-sm text-gray-600 capitalize">{court.type.toLowerCase()}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    court.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : court.status === 'MAINTENANCE'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {court.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{court.capacity} people</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">LKR {court.pricePerHour}/hour</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hours:</span>
                    <span className="font-medium">{court.openingTime} - {court.closingTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Slots:</span>
                    <span className="font-medium">{court.slotDurationMinutes} min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(court)}
                      className="text-blue-600 hover:text-blue-700 p-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourt(court.courtId)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {court.dynamicPricingEnabled && (
                    <div className="flex items-center text-orange-600 text-sm">
                      <CogIcon className="w-4 h-4 mr-1" />
                      Dynamic Pricing
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {courts.length === 0 && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courts yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first court.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
            >
              Add Your First Court
            </button>
          </div>
        )}
      </div>

      {/* Add Court Modal */}
      <CourtModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        onSubmit={handleAddCourt}
        title="Add New Court"
        submitText="Add Court"
      />

      {/* Edit Court Modal */}
      <CourtModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCourt(null);
          resetForm();
        }}
        onSubmit={handleEditCourt}
        title="Edit Court"
        submitText="Update Court"
      />
    </div>
  );
}

