import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  XMarkIcon,
  CheckIcon
} from "@heroicons/react/24/outline";

export default function TimeSlotManagement() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [venue, setVenue] = useState(null);

  // Block slot form
  const [blockForm, setBlockForm] = useState({
    startTime: '',
    endTime: '',
    reason: '',
    isRecurring: false,
    recurringDays: []
  });

  // Maintenance form
  const [maintenanceForm, setMaintenanceForm] = useState({
    startTime: '',
    endTime: '',
    reason: '',
    isRecurring: false,
    recurringDays: []
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchVenueAndData();
  }, [venueId]);

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedCourt, selectedDate]);

  const fetchVenueAndData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with real API calls
      // const venueData = await api.getVenueById(venueId);
      // const courtsData = await api.getCourtsByVenue(venueId);
      
      // Mock data for now
      setVenue({
        name: 'Colombo Indoor Sports Complex',
        venueId: venueId
      });
      
      const courtsData = [
        { 
          courtId: 1, 
          courtName: 'Basketball Court 1',
          openingTime: '06:00',
          closingTime: '23:00',
          slotDurationMinutes: 30
        },
        { 
          courtId: 2, 
          courtName: 'Futsal Court 1',
          openingTime: '06:00',
          closingTime: '23:00',
          slotDurationMinutes: 30
        },
        { 
          courtId: 3, 
          courtName: 'Badminton Court 1',
          openingTime: '06:00',
          closingTime: '23:00',
          slotDurationMinutes: 30
        }
      ];
      
      setCourts(courtsData);
      if (courtsData.length > 0) {
        setSelectedCourt(courtsData[0]);
      }
    } catch (error) {
      console.error('Error fetching venue and data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      // TODO: Replace with real API call
      // const slots = await api.getTimeSlotsForDate(selectedCourt.courtId, selectedDate);
      
      // Generate mock time slots based on court configuration
      const slots = generateTimeSlots(selectedCourt, selectedDate);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  const generateTimeSlots = (court, date) => {
    const slots = [];
    const startTime = new Date(`2000-01-01T${court.openingTime}`);
    const endTime = new Date(`2000-01-01T${court.closingTime}`);
    const slotDuration = court.slotDurationMinutes;
    
    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const slotStart = currentTime.toTimeString().slice(0, 5);
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000).toTimeString().slice(0, 5);
      
      // Check if slot is during break time (12:00-14:00)
      const isBreakTime = currentTime.getHours() >= 12 && currentTime.getHours() < 14;
      
      slots.push({
        id: `${court.courtId}-${date}-${slotStart}`,
        startTime: slotStart,
        endTime: slotEnd,
        status: isBreakTime ? 'BLOCKED' : 'AVAILABLE',
        reason: isBreakTime ? 'Break Time' : null,
        isRecurring: false,
        recurringDays: []
      });
      
      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }
    
    return slots;
  };

  const handleBlockSlots = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with real API call
      // await api.blockTimeSlots(selectedCourt.courtId, selectedDate, blockForm);
      
      // Update local state
      const updatedSlots = timeSlots.map(slot => {
        if (slot.startTime >= blockForm.startTime && slot.startTime < blockForm.endTime) {
          return {
            ...slot,
            status: 'BLOCKED',
            reason: blockForm.reason,
            isRecurring: blockForm.isRecurring,
            recurringDays: blockForm.recurringDays
          };
        }
        return slot;
      });
      
      setTimeSlots(updatedSlots);
      setShowBlockModal(false);
      resetBlockForm();
    } catch (error) {
      console.error('Error blocking slots:', error);
    }
  };

  const handleMaintenanceSlots = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with real API call
      // await api.setMaintenanceSlots(selectedCourt.courtId, selectedDate, maintenanceForm);
      
      // Update local state
      const updatedSlots = timeSlots.map(slot => {
        if (slot.startTime >= maintenanceForm.startTime && slot.startTime < maintenanceForm.endTime) {
          return {
            ...slot,
            status: 'MAINTENANCE',
            reason: maintenanceForm.reason,
            isRecurring: maintenanceForm.isRecurring,
            recurringDays: maintenanceForm.recurringDays
          };
        }
        return slot;
      });
      
      setTimeSlots(updatedSlots);
      setShowMaintenanceModal(false);
      resetMaintenanceForm();
    } catch (error) {
      console.error('Error setting maintenance slots:', error);
    }
  };

  const handleUnblockSlot = async (slotId) => {
    try {
      // TODO: Replace with real API call
      // await api.unblockTimeSlot(slotId);
      
      // Update local state
      const updatedSlots = timeSlots.map(slot => 
        slot.id === slotId 
          ? { ...slot, status: 'AVAILABLE', reason: null, isRecurring: false, recurringDays: [] }
          : slot
      );
      
      setTimeSlots(updatedSlots);
    } catch (error) {
      console.error('Error unblocking slot:', error);
    }
  };

  const resetBlockForm = () => {
    setBlockForm({
      startTime: '',
      endTime: '',
      reason: '',
      isRecurring: false,
      recurringDays: []
    });
  };

  const resetMaintenanceForm = () => {
    setMaintenanceForm({
      startTime: '',
      endTime: '',
      reason: '',
      isRecurring: false,
      recurringDays: []
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'BOOKED':
        return 'bg-blue-100 text-blue-800';
      case 'BLOCKED':
        return 'bg-red-100 text-red-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESERVED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const BlockModal = ({ isOpen, onClose, onSubmit, title, submitText }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={blockForm.startTime}
                  onChange={(e) => setBlockForm(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={blockForm.endTime}
                  onChange={(e) => setBlockForm(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason *
              </label>
              <textarea
                value={blockForm.reason}
                onChange={(e) => setBlockForm(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={blockForm.isRecurring}
                  onChange={(e) => setBlockForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="mr-2"
                />
                Recurring Block
              </label>
            </div>

            {blockForm.isRecurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recurring Days
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {weekDays.map((day, index) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={blockForm.recurringDays.includes(index)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBlockForm(prev => ({ 
                              ...prev, 
                              recurringDays: [...prev.recurringDays, index] 
                            }));
                          } else {
                            setBlockForm(prev => ({ 
                              ...prev, 
                              recurringDays: prev.recurringDays.filter(d => d !== index) 
                            }));
                          }
                        }}
                        className="mr-2"
                      />
                      {day.slice(0, 3)}
                    </label>
                  ))}
                </div>
              </div>
            )}

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Time Slot Management</h1>
              <p className="text-gray-600 mt-2">
                Manage time slots and availability for {venue?.name}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBlockModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
              >
                <XMarkIcon className="w-5 h-5 mr-2" />
                Block Slots
              </button>
              <button
                onClick={() => setShowMaintenanceModal(true)}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 flex items-center"
              >
                <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
                Set Maintenance
              </button>
            </div>
          </div>
        </div>

        {/* Court and Date Selection */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Court
              </label>
              <select
                value={selectedCourt?.courtId || ''}
                onChange={(e) => {
                  const court = courts.find(c => c.courtId == e.target.value);
                  setSelectedCourt(court);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select a court</option>
                {courts.map(court => (
                  <option key={court.courtId} value={court.courtId}>
                    {court.courtName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {selectedCourt && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Court Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Opening Time:</span>
                  <span className="ml-2 font-medium">{selectedCourt.openingTime}</span>
                </div>
                <div>
                  <span className="text-gray-600">Closing Time:</span>
                  <span className="ml-2 font-medium">{selectedCourt.closingTime}</span>
                </div>
                <div>
                  <span className="text-gray-600">Slot Duration:</span>
                  <span className="ml-2 font-medium">{selectedCourt.slotDurationMinutes} minutes</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Time Slots Grid */}
        {selectedCourt && timeSlots.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Time Slots for {selectedCourt.courtName} - {new Date(selectedDate).toLocaleDateString()}
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-lg border-2 text-center ${
                      slot.status === 'AVAILABLE'
                        ? 'border-green-200 bg-green-50'
                        : slot.status === 'BOOKED'
                        ? 'border-blue-200 bg-blue-50'
                        : slot.status === 'BLOCKED'
                        ? 'border-red-200 bg-red-50'
                        : slot.status === 'MAINTENANCE'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(slot.status)}`}>
                      {slot.status}
                    </div>
                    {slot.reason && (
                      <div className="mt-1 text-xs text-gray-600 truncate" title={slot.reason}>
                        {slot.reason}
                      </div>
                    )}
                    {(slot.status === 'BLOCKED' || slot.status === 'MAINTENANCE') && (
                      <button
                        onClick={() => handleUnblockSlot(slot.id)}
                        className="mt-2 w-full text-xs bg-white text-gray-700 px-2 py-1 rounded border hover:bg-gray-50"
                      >
                        Unblock
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedCourt && timeSlots.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No time slots available</h3>
            <p className="text-gray-600">Select a different date or court to view time slots.</p>
          </div>
        )}

        {!selectedCourt && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a court</h3>
            <p className="text-gray-600">Choose a court to manage its time slots.</p>
          </div>
        )}

        {/* Summary Stats */}
        {selectedCourt && timeSlots.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500">
                  <CheckIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {timeSlots.filter(slot => slot.status === 'AVAILABLE').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Booked</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {timeSlots.filter(slot => slot.status === 'BOOKED').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-500">
                  <XMarkIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Blocked</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {timeSlots.filter(slot => slot.status === 'BLOCKED').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-500">
                  <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Maintenance</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {timeSlots.filter(slot => slot.status === 'MAINTENANCE').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block Slots Modal */}
      <BlockModal
        isOpen={showBlockModal}
        onClose={() => {
          setShowBlockModal(false);
          resetBlockForm();
        }}
        onSubmit={handleBlockSlots}
        title="Block Time Slots"
        submitText="Block Slots"
      />

      {/* Maintenance Modal */}
      <BlockModal
        isOpen={showMaintenanceModal}
        onClose={() => {
          setShowMaintenanceModal(false);
          resetMaintenanceForm();
        }}
        onSubmit={handleMaintenanceSlots}
        title="Set Maintenance Time"
        submitText="Set Maintenance"
      />
    </div>
  );
}

