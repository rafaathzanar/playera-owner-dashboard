import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

// EquipmentModal component defined outside to prevent recreation
const EquipmentModal = ({ isOpen, onClose, onSubmit, title, submitText, equipmentForm, handleInputChange, courts, equipmentStatuses }) => {
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Name *
              </label>
              <input
                type="text"
                value={equipmentForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Court *
              </label>
              <select
                value={equipmentForm.courtId}
                onChange={(e) => handleInputChange('courtId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select a court</option>
                {courts.map(court => (
                  <option key={court.courtId} value={court.courtId}>
                    {court.courtName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={equipmentForm.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Pricing & Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate per Hour (LKR) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={equipmentForm.ratePerHour}
                onChange={(e) => handleInputChange('ratePerHour', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={equipmentForm.totalQuantity}
                onChange={(e) => handleInputChange('totalQuantity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={equipmentForm.availableQuantity}
                onChange={(e) => handleInputChange('availableQuantity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
              Status
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Status
              </label>
              <select
                value={equipmentForm.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {equipmentStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
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

export default function EquipmentManagement() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState([]);
  const [courts, setCourts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [venue, setVenue] = useState(null);
  const [error, setError] = useState(null);

  // Equipment form state
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    description: '',
    ratePerHour: '',
    totalQuantity: '',
    availableQuantity: '',
    status: 'AVAILABLE',
    courtId: ''
  });

  const equipmentStatuses = [
    'AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RESERVED'
  ];

  useEffect(() => {
    if (venueId) {
      fetchVenueAndData();
    }
  }, [venueId]);

  const fetchVenueAndData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.userId) {
        console.error('User not authenticated');
        setVenue(null);
        setCourts([]);
        setEquipment([]);
        return;
      }

      // Fetch venue data first
      const venueData = await api.getVenueByOwner(user.userId);
      console.log('Venue data received:', venueData);
      
      if (venueData && venueData.venueId) {
        setVenue(venueData);
        
        // Fetch courts and equipment for this venue
        const [courtsData, equipmentData] = await Promise.all([
          api.getCourtsByVenue(venueData.venueId),
          api.getEquipment(venueData.venueId)
        ]);
        
        setCourts(courtsData || []);
        setEquipment(equipmentData || []);
      } else {
        console.log('No venue data or invalid venue ID:', venueData);
        setVenue(null);
        setCourts([]);
        setEquipment([]);
      }
      
    } catch (error) {
      console.error('Error fetching venue and data:', error);
      setError('Failed to load venue data. Please try again.');
      setVenue(null);
      setCourts([]);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((field, value) => {
    console.log('handleInputChange called:', field, value); // Debug log
    setEquipmentForm(prev => {
      const newState = { ...prev, [field]: value };
      console.log('New form state:', newState); // Debug log
      return newState;
    });
  }, []);

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    console.log('Submitting form with data:', equipmentForm); // Debug log
    
    try {
      // Validate that available quantity doesn't exceed total quantity
      if (parseInt(equipmentForm.availableQuantity) > parseInt(equipmentForm.totalQuantity)) {
        alert('Available quantity cannot exceed total quantity');
        return;
      }

      const equipmentData = {
        ...equipmentForm,
        ratePerHour: parseFloat(equipmentForm.ratePerHour),
        totalQuantity: parseInt(equipmentForm.totalQuantity),
        availableQuantity: parseInt(equipmentForm.availableQuantity)
      };

      console.log('Sending to API:', equipmentData); // Debug log
      const newEquipment = await api.createEquipment(equipmentData);
      
      setEquipment(prev => [...prev, newEquipment]);
      setShowAddModal(false);
      resetForm();
      
      // Refresh data to get updated counts
      fetchVenueAndData();
    } catch (error) {
      console.error('Error adding equipment:', error);
      alert('Failed to add equipment. Please try again.');
    }
  };

  const handleEditEquipment = async (e) => {
    e.preventDefault();
    try {
      // Validate that available quantity doesn't exceed total quantity
      if (parseInt(equipmentForm.availableQuantity) > parseInt(equipmentForm.totalQuantity)) {
        alert('Available quantity cannot exceed total quantity');
        return;
      }

      const equipmentData = {
        ...equipmentForm,
        ratePerHour: parseFloat(equipmentForm.ratePerHour),
        totalQuantity: parseInt(equipmentForm.totalQuantity),
        availableQuantity: parseInt(equipmentForm.availableQuantity)
      };

      await api.updateEquipment(editingEquipment.equipmentId, equipmentData);
      
      // Update local state
      setEquipment(prev => prev.map(eq => 
        eq.equipmentId === editingEquipment.equipmentId 
          ? { 
              ...eq, 
              ...equipmentData,
              courtName: courts.find(c => c.courtId == equipmentForm.courtId)?.courtName || 'Unknown Court'
            }
          : eq
      ));
      
      setShowEditModal(false);
      setEditingEquipment(null);
      resetForm();
      
      // Refresh data to get updated counts
      fetchVenueAndData();
    } catch (error) {
      console.error('Error updating equipment:', error);
      alert('Failed to update equipment. Please try again.');
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (window.confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
      try {
        await api.deleteEquipment(equipmentId);
        
        setEquipment(prev => prev.filter(eq => eq.equipmentId !== equipmentId));
        
        // Refresh data to get updated counts
        fetchVenueAndData();
      } catch (error) {
        console.error('Error deleting equipment:', error);
        alert('Failed to delete equipment. Please try again.');
      }
    }
  };

  const openEditModal = (eq) => {
    setEditingEquipment(eq);
    setEquipmentForm({
      name: eq.name,
      description: eq.description,
      ratePerHour: eq.ratePerHour,
      totalQuantity: eq.totalQuantity,
      availableQuantity: eq.availableQuantity,
      status: eq.status,
      courtId: eq.courtId
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setEquipmentForm({
      name: '',
      description: '',
      ratePerHour: '',
      totalQuantity: '',
      availableQuantity: '',
      status: 'AVAILABLE',
      courtId: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'OUT_OF_SERVICE':
        return 'bg-gray-100 text-gray-800';
      case 'RESERVED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            Before you can manage equipment, you need to create a venue first. This will be your sports facility where customers can rent equipment.
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
            Before you can manage equipment, you need to add courts to your venue. Equipment is associated with specific courts where customers can use it.
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
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <ExclamationTriangleIcon className="w-12 h-12 mr-2" />
        <p>{error}</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
              <p className="text-gray-600 mt-2">
                Manage rental equipment for {venue?.name}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Equipment
            </button>
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((eq) => (
            <div key={eq.equipmentId} className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{eq.name}</h3>
                    <p className="text-sm text-gray-600">{eq.courtName}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(eq.status)}`}>
                    {eq.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{eq.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium">LKR {eq.ratePerHour}/hour</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{eq.availableQuantity}/{eq.totalQuantity}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(eq)}
                      className="text-blue-600 hover:text-blue-700 p-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEquipment(eq.equipmentId)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {eq.availableQuantity > 0 ? 'Available' : 'Out of Stock'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {equipment.length === 0 && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding rental equipment for your courts.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
            >
              Add Your First Equipment
            </button>
          </div>
        )}

        {/* Summary Stats */}
        {equipment.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                  <p className="text-2xl font-semibold text-gray-900">{equipment.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {equipment.filter(eq => eq.status === 'AVAILABLE').length}
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
                    {equipment.filter(eq => eq.status === 'MAINTENANCE').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-500">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    LKR {equipment.reduce((sum, eq) => sum + (eq.ratePerHour * eq.totalQuantity), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Equipment Modal */}
      <EquipmentModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        onSubmit={handleAddEquipment}
        title="Add New Equipment"
        submitText="Add Equipment"
        equipmentForm={equipmentForm}
        handleInputChange={handleInputChange}
        courts={courts}
        equipmentStatuses={equipmentStatuses}
      />

      {/* Edit Equipment Modal */}
      <EquipmentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingEquipment(null);
          resetForm();
        }}
        onSubmit={handleEditEquipment}
        title="Edit Equipment"
        submitText="Update Equipment"
        equipmentForm={equipmentForm}
        handleInputChange={handleInputChange}
        courts={courts}
        equipmentStatuses={equipmentStatuses}
      />
    </div>
  );
}

