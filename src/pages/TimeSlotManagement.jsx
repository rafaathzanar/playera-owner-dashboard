import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  XMarkIcon, 
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

export default function TimeSlotManagement() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [venue, setVenue] = useState(null);
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showRecurringBlockModal, setShowRecurringBlockModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Form states
  const [blockForm, setBlockForm] = useState({
    startTime: '',
    endTime: '',
    reason: '',
    isMaintenance: false
  });
  
  const [recurringBlockForm, setRecurringBlockForm] = useState({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    reason: '',
    isMaintenance: false,
    recurringDays: []
  });
  
  const [settingsForm, setSettingsForm] = useState({
    openingTime: '',
    closingTime: '',
    slotDurationMinutes: 60,
    isActiveOnWeekends: true,
    isActiveOnHolidays: true,
    hasBreakTime: false,
    breakStartTime: '',
    breakEndTime: ''
  });

  // Initialize settings form when court is selected
  useEffect(() => {
    if (selectedCourt) {
      setSettingsForm({
        openingTime: selectedCourt.openingTime || '',
        closingTime: selectedCourt.closingTime || '',
        slotDurationMinutes: selectedCourt.slotDurationMinutes || 60,
        isActiveOnWeekends: selectedCourt.isActiveOnWeekends ?? true,
        isActiveOnHolidays: selectedCourt.isActiveOnHolidays ?? true,
        hasBreakTime: selectedCourt.hasBreakTime || false,
        breakStartTime: selectedCourt.breakStartTime || '',
        breakEndTime: selectedCourt.breakEndTime || ''
      });
    }
  }, [selectedCourt]);

  // Fetch venue and courts data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data for venue ID:', venueId);
        const [venueData, courtsData] = await Promise.all([
          api.getVenueById(venueId),
          api.getCourtsByVenue(venueId)
        ]);
        
        console.log('Venue data:', venueData);
        console.log('Courts data:', courtsData);
        
        setVenue(venueData);
        setCourts(courtsData);
        
        if (courtsData.length > 0) {
          setSelectedCourt(courtsData[0]);
        }
      } catch (err) {
        setError('Failed to fetch venue data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (venueId) {
      fetchData();
    }
  }, [venueId]);

  // Fetch time slots when court or date changes
  useEffect(() => {
    if (selectedCourt && selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedCourt, selectedDate]);

  const fetchTimeSlots = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      console.log('Fetching time slots for court:', selectedCourt.courtId, 'date:', dateStr);
      const slots = await api.getAllTimeSlotsForDate(selectedCourt.courtId, dateStr);
      console.log('Received time slots:', slots);
      setTimeSlots(slots || []);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setTimeSlots([]);
      // Show user-friendly error
      if (err.message.includes('404')) {
        alert('No time slots found for this date. The court might not have any slots configured.');
      } else if (err.message.includes('403')) {
        alert('Access denied. Please check your permissions.');
      } else {
        alert(`Failed to load time slots: ${err.message}`);
      }
    }
  };

  const handleDateChange = (direction) => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const handleBlockSlot = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      await api.blockTimeSlot(
        selectedCourt.courtId,
        dateStr,
        blockForm.startTime,
        blockForm.endTime,
        blockForm.reason,
        blockForm.isMaintenance
      );
      
      setShowBlockModal(false);
      setBlockForm({ startTime: '', endTime: '', reason: '', isMaintenance: false });
      fetchTimeSlots();
    } catch (err) {
      console.error('Error blocking slot:', err);
      alert('Failed to block time slot');
    }
  };

  const handleRecurringBlock = async () => {
    try {
      await api.blockRecurringTimeSlots(
        selectedCourt.courtId,
        recurringBlockForm.startDate,
        recurringBlockForm.endDate,
        recurringBlockForm.startTime,
        recurringBlockForm.endTime,
        recurringBlockForm.reason,
        recurringBlockForm.isMaintenance,
        recurringBlockForm.recurringDays
      );
      
      setShowRecurringBlockModal(false);
      setRecurringBlockForm({
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        reason: '',
        isMaintenance: false,
        recurringDays: []
      });
      fetchTimeSlots();
    } catch (err) {
      console.error('Error blocking recurring slots:', err);
      alert('Failed to block recurring time slots');
    }
  };

  const handleUnblockSlot = async (slot) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      await api.unblockTimeSlot(
        selectedCourt.courtId,
        dateStr,
        slot.startTime,
        slot.endTime
      );
      fetchTimeSlots();
    } catch (err) {
      console.error('Error unblocking slot:', err);
      alert('Failed to unblock time slot');
    }
  };

  const handleUpdateSettings = async () => {
    // Validate required fields
    if (!settingsForm.openingTime || !settingsForm.closingTime || !settingsForm.slotDurationMinutes) {
      alert('Please fill in all required fields: Opening Time, Closing Time, and Slot Duration.');
      return;
    }

    // Validate time logic
    if (settingsForm.openingTime >= settingsForm.closingTime) {
      alert('Closing time must be after opening time.');
      return;
    }

    if (settingsForm.hasBreakTime && (!settingsForm.breakStartTime || !settingsForm.breakEndTime)) {
      alert('Please set both break start and end times if break time is enabled.');
      return;
    }

    if (settingsForm.hasBreakTime && 
        (settingsForm.breakStartTime >= settingsForm.breakEndTime || 
         settingsForm.breakStartTime <= settingsForm.openingTime || 
         settingsForm.breakEndTime >= settingsForm.closingTime)) {
      alert('Break time must be within operating hours and end time must be after start time.');
      return;
    }

    try {
      // Use the existing updateCourt endpoint instead of the non-existent time-settings endpoint
      const courtUpdateData = {
        courtName: selectedCourt.courtName,
        type: selectedCourt.type,
        capacity: selectedCourt.capacity,
        pricePerHour: selectedCourt.pricePerHour,
        description: selectedCourt.description || '',
        isIndoor: selectedCourt.isIndoor || false,
        isLighted: selectedCourt.isLighted || false,
        isAirConditioned: selectedCourt.isAirConditioned || false,
        minBookingDuration: selectedCourt.minBookingDuration || 60,
        maxBookingDuration: selectedCourt.maxBookingDuration || 240,
        openingTime: settingsForm.openingTime,
        closingTime: settingsForm.closingTime,
        slotDurationMinutes: settingsForm.slotDurationMinutes,
        isActiveOnWeekends: settingsForm.isActiveOnWeekends,
        isActiveOnHolidays: settingsForm.isActiveOnHolidays,
        hasBreakTime: settingsForm.hasBreakTime,
        breakStartTime: settingsForm.breakStartTime,
        breakEndTime: settingsForm.breakEndTime,
        venueId: selectedCourt.venueId
      };

      console.log('Updating court with data:', courtUpdateData);
      await api.updateCourt(selectedCourt.courtId, courtUpdateData);
      setShowSettingsModal(false);
      alert('Court settings updated successfully');
      
      // Refresh the page to show updated settings
      window.location.reload();
    } catch (err) {
      console.error('Error updating settings:', err);
      alert('Failed to update court settings');
    }
  };

  const getSlotStatusColor = (slot) => {
    if (!slot.available) {
      if (slot.status === 'BOOKED') return 'bg-red-100 text-red-800';
      if (slot.status === 'MAINTENANCE') return 'bg-yellow-100 text-yellow-800';
      if (slot.status === 'RESERVED') return 'bg-orange-100 text-orange-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getSlotStatusText = (slot) => {
    if (!slot.available) {
      if (slot.status === 'BOOKED') return 'Booked';
      if (slot.status === 'MAINTENANCE') return 'Maintenance';
      if (slot.status === 'RESERVED') return 'Blocked';
    }
    return 'Available';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading time slot management...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!venue || courts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">
            {!venue ? 'No venue found' : 'No courts found'}. Please create a venue and courts first.
          </p>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => navigate('/venues')}
              className="block w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Go to Venues
            </button>
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Refresh Page
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
          <h1 className="text-3xl font-bold text-gray-900">Time Slot Management</h1>
          <p className="text-gray-600 mt-2">
            Manage availability and scheduling for {venue.venueName}
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
                <p className="text-sm text-gray-600">${court.pricePerHour}/hour</p>
              </button>
            ))}
          </div>
          
          {/* Debug Info */}
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
            <p><strong>Debug Info:</strong></p>
            <p>Venue ID: {venueId}</p>
            <p>Courts loaded: {courts.length}</p>
            <p>Selected court: {selectedCourt ? `${selectedCourt.courtName} (ID: ${selectedCourt.courtId})` : 'None'}</p>
            <p>Current date: {selectedDate.toISOString().split('T')[0]}</p>
            <p>Time slots loaded: {timeSlots.length}</p>
            {selectedCourt && (
              <>
                <p><strong>Court Settings:</strong></p>
                <p>Opening Time: {selectedCourt.openingTime || 'NOT SET'}</p>
                <p>Closing Time: {selectedCourt.closingTime || 'NOT SET'}</p>
                <p>Slot Duration: {selectedCourt.slotDurationMinutes || 'NOT SET'} minutes</p>
                <p>Weekend Active: {selectedCourt.isActiveOnWeekends ? 'Yes' : 'No'}</p>
                <p>Holiday Active: {selectedCourt.isActiveOnHolidays ? 'Yes' : 'No'}</p>
              </>
            )}
          </div>
        </div>

        {selectedCourt && (
          <>
            {/* Court Settings */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {selectedCourt.courtName} Settings
                </h2>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                >
                  <CogIcon className="h-5 w-5 mr-2" />
                  Edit Settings
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Operating Hours:</span>
                  <p className="text-gray-600">
                    {selectedCourt.openingTime} - {selectedCourt.closingTime}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Slot Duration:</span>
                  <p className="text-gray-600">{selectedCourt.slotDurationMinutes} minutes</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Weekend Activity:</span>
                  <p className="text-gray-600">
                    {selectedCourt.isActiveOnWeekends ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {/* Date Navigation */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Time Slots</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowBlockModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Block Slot
                  </button>
                  <button
                    onClick={() => setShowRecurringBlockModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Block Recurring
                  </button>
                </div>
              </div>

              {/* Date Picker */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={() => handleDateChange('prev')}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-lg font-medium text-gray-900">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <button
                  onClick={() => handleDateChange('next')}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Time Slots Grid */}
              {timeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Slots Available</h3>
                  <p className="text-gray-600 mb-4">
                    {!selectedCourt.openingTime || !selectedCourt.closingTime || !selectedCourt.slotDurationMinutes
                      ? 'Court operating hours are not configured. Please set opening time, closing time, and slot duration in the court settings.'
                      : 'No time slots are available for this date. This might be due to court inactivity on weekends/holidays or maintenance schedules.'}
                  </p>
                  {(!selectedCourt.openingTime || !selectedCourt.closingTime || !selectedCourt.slotDurationMinutes) && (
                    <button
                      onClick={() => setShowSettingsModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                    >
                      <CogIcon className="h-5 w-5 mr-2" />
                      Configure Court Settings
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getSlotStatusColor(slot)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {slot.startTime} - {slot.endTime}
                          </p>
                          <p className="text-xs opacity-75">
                            {getSlotStatusText(slot)}
                          </p>
                        </div>
                        {!slot.available && slot.status !== 'BOOKED' && (
                          <button
                            onClick={() => handleUnblockSlot(slot)}
                            className="text-red-600 hover:text-red-800"
                            title="Unblock slot"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Block Slot Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Block Time Slot</h3>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={blockForm.startTime}
                    onChange={(e) => setBlockForm({...blockForm, startTime: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={blockForm.endTime}
                    onChange={(e) => setBlockForm({...blockForm, endTime: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <input
                    type="text"
                    value={blockForm.reason}
                    onChange={(e) => setBlockForm({...blockForm, reason: e.target.value})}
                    placeholder="e.g., Maintenance, Private event"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenance"
                    checked={blockForm.isMaintenance}
                    onChange={(e) => setBlockForm({...blockForm, isMaintenance: e.target.checked})}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="maintenance" className="ml-2 block text-sm text-gray-900">
                    Mark as maintenance
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockSlot}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                >
                  Block Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Block Modal */}
      {showRecurringBlockModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Block Recurring Time Slots</h3>
                <button
                  onClick={() => setShowRecurringBlockModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={recurringBlockForm.startDate}
                    onChange={(e) => setRecurringBlockForm({...recurringBlockForm, startDate: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={recurringBlockForm.endDate}
                    onChange={(e) => setRecurringBlockForm({...recurringBlockForm, endDate: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={recurringBlockForm.startTime}
                    onChange={(e) => setRecurringBlockForm({...recurringBlockForm, startTime: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={recurringBlockForm.endTime}
                    onChange={(e) => setRecurringBlockForm({...recurringBlockForm, endTime: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <input
                    type="text"
                    value={recurringBlockForm.reason}
                    onChange={(e) => setRecurringBlockForm({...recurringBlockForm, reason: e.target.value})}
                    placeholder="e.g., Weekly maintenance"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="recurringMaintenance"
                    checked={recurringBlockForm.isMaintenance}
                    onChange={(e) => setRecurringBlockForm({...recurringBlockForm, isMaintenance: e.target.checked})}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="recurringMaintenance" className="ml-2 block text-sm text-gray-900">
                    Mark as maintenance
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recurring Days</label>
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const newDays = recurringBlockForm.recurringDays.includes(index)
                            ? recurringBlockForm.recurringDays.filter(d => d !== index)
                            : [...recurringBlockForm.recurringDays, index];
                          setRecurringBlockForm({...recurringBlockForm, recurringDays: newDays});
                        }}
                        className={`p-2 text-xs rounded ${
                          recurringBlockForm.recurringDays.includes(index)
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowRecurringBlockModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecurringBlock}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                >
                  Block Recurring
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Court Settings</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> These settings are required to generate time slots. 
                    Opening time, closing time, and slot duration must be configured for the court to show available booking slots.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Opening Time *</label>
                  <input
                    type="time"
                    value={settingsForm.openingTime}
                    onChange={(e) => setSettingsForm({...settingsForm, openingTime: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Closing Time *</label>
                  <input
                    type="time"
                    value={settingsForm.closingTime}
                    onChange={(e) => setSettingsForm({...settingsForm, closingTime: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Slot Duration (minutes) *</label>
                  <select
                    value={settingsForm.slotDurationMinutes}
                    onChange={(e) => setSettingsForm({...settingsForm, slotDurationMinutes: parseInt(e.target.value)})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="weekends"
                    checked={settingsForm.isActiveOnWeekends}
                    onChange={(e) => setSettingsForm({...settingsForm, isActiveOnWeekends: e.target.checked})}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="weekends" className="ml-2 block text-sm text-gray-900">
                    Active on weekends
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="holidays"
                    checked={settingsForm.isActiveOnHolidays}
                    onChange={(e) => setSettingsForm({...settingsForm, isActiveOnHolidays: e.target.checked})}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="holidays" className="ml-2 block text-sm text-gray-900">
                    Active on holidays
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="breakTime"
                    checked={settingsForm.hasBreakTime}
                    onChange={(e) => setSettingsForm({...settingsForm, hasBreakTime: e.target.checked})}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="breakTime" className="ml-2 block text-sm text-gray-900">
                    Has break time
                  </label>
                </div>
                
                {settingsForm.hasBreakTime && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Break Start Time</label>
                      <input
                        type="time"
                        value={settingsForm.breakStartTime}
                        onChange={(e) => setSettingsForm({...settingsForm, breakStartTime: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Break End Time</label>
                      <input
                        type="time"
                        value={settingsForm.breakEndTime}
                        onChange={(e) => setSettingsForm({...settingsForm, breakEndTime: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
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
                  onClick={handleUpdateSettings}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                >
                  Update Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
