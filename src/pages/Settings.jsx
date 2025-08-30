import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CogIcon,
  BellIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  UserIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function Settings() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [venue, setVenue] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    venueName: '',
    contactEmail: '',
    contactPhone: '',
    timezone: 'Asia/Colombo',
    currency: 'LKR',
    language: 'en'
  });

  // Business Rules
  const [businessRules, setBusinessRules] = useState({
    autoApprovalEnabled: false,
    minAdvanceBookingHours: 24,
    maxAdvanceBookingDays: 30,
    earliestBookingTime: '06:00',
    latestBookingTime: '23:00',
    cancellationPolicy: 'Free cancellation up to 24 hours before booking',
    refundPolicy: 'Full refund for cancellations made 24+ hours in advance',
    depositRequired: false,
    depositAmount: 0,
    maxConcurrentBookings: 3
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newBookingAlerts: true,
    cancellationAlerts: true,
    paymentAlerts: true,
    maintenanceAlerts: true,
    dailyReports: false,
    weeklyReports: true,
    monthlyReports: true
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    stripeEnabled: false,
    stripePublishableKey: '',
    stripeSecretKey: '',
    paypalEnabled: false,
    paypalClientId: '',
    paypalSecret: '',
    bankTransferEnabled: true,
    bankAccountDetails: '',
    cashPaymentEnabled: true,
    commissionRate: 10,
    taxRate: 15
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    ipWhitelist: '',
    auditLogging: true
  });

  useEffect(() => {
    fetchVenueAndSettings();
  }, [venueId]);

  const fetchVenueAndSettings = async () => {
    try {
      setLoading(true);
      // TODO: Replace with real API calls
      // const venueData = await api.getVenueById(venueId);
      // const settingsData = await api.getVenueSettings(venueId);
      
      // Mock data for now
      setVenue({
        name: 'Colombo Indoor Sports Complex',
        venueId: venueId
      });
      
      setGeneralSettings({
        venueName: 'Colombo Indoor Sports Complex',
        contactEmail: 'admin@colomboindoor.com',
        contactPhone: '+94779694278',
        timezone: 'Asia/Colombo',
        currency: 'LKR',
        language: 'en'
      });
      
      setBusinessRules({
        autoApprovalEnabled: false,
        minAdvanceBookingHours: 24,
        maxAdvanceBookingDays: 30,
        earliestBookingTime: '06:00',
        latestBookingTime: '23:00',
        cancellationPolicy: 'Free cancellation up to 24 hours before booking',
        refundPolicy: 'Full refund for cancellations made 24+ hours in advance',
        depositRequired: false,
        depositAmount: 0,
        maxConcurrentBookings: 3
      });
      
      setNotificationSettings({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        newBookingAlerts: true,
        cancellationAlerts: true,
        paymentAlerts: true,
        maintenanceAlerts: true,
        dailyReports: false,
        weeklyReports: true,
        monthlyReports: true
      });
      
      setPaymentSettings({
        stripeEnabled: false,
        stripePublishableKey: '',
        stripeSecretKey: '',
        paypalEnabled: false,
        paypalClientId: '',
        paypalSecret: '',
        bankTransferEnabled: true,
        bankAccountDetails: 'Bank of Ceylon\nAccount: 1234567890\nBranch: Dehiwala',
        cashPaymentEnabled: true,
        commissionRate: 10,
        taxRate: 15
      });
      
      setSecuritySettings({
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        loginAttempts: 5,
        ipWhitelist: '',
        auditLogging: true
      });
    } catch (error) {
      console.error('Error fetching venue and settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (settingsType) => {
    try {
      setSaving(true);
      // TODO: Replace with real API calls
      // await api.updateVenueSettings(venueId, settingsType, getSettingsByType(settingsType));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`${settingsType} settings saved successfully!`);
    } catch (error) {
      console.error(`Error saving ${settingsType} settings:`, error);
      alert(`Error saving ${settingsType} settings. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  const getSettingsByType = (type) => {
    switch (type) {
      case 'general':
        return generalSettings;
      case 'business':
        return businessRules;
      case 'notifications':
        return notificationSettings;
      case 'payment':
        return paymentSettings;
      case 'security':
        return securitySettings;
      default:
        return {};
    }
  };

  const handleInputChange = (settingsType, field, value) => {
    switch (settingsType) {
      case 'general':
        setGeneralSettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'business':
        setBusinessRules(prev => ({ ...prev, [field]: value }));
        break;
      case 'notifications':
        setNotificationSettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'payment':
        setPaymentSettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'security':
        setSecuritySettings(prev => ({ ...prev, [field]: value }));
        break;
    }
  };

  const SettingsSection = ({ title, icon: Icon, children, settingsType }) => (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={() => handleSaveSettings(settingsType)}
            disabled={saving}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure your venue management preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'business'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Business Rules
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payment'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payment
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security
            </button>
          </nav>
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <SettingsSection title="General Settings" icon={BuildingOfficeIcon} settingsType="general">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Name
                </label>
                <input
                  type="text"
                  value={generalSettings.venueName}
                  onChange={(e) => handleInputChange('general', 'venueName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={generalSettings.contactPhone}
                  onChange={(e) => handleInputChange('general', 'contactPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={generalSettings.timezone}
                  onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Asia/Colombo">Asia/Colombo (UTC+5:30)</option>
                  <option value="UTC">UTC (UTC+0)</option>
                  <option value="America/New_York">America/New_York (UTC-5)</option>
                  <option value="Europe/London">Europe/London (UTC+0)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={generalSettings.currency}
                  onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="LKR">LKR (Sri Lankan Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={generalSettings.language}
                  onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="en">English</option>
                  <option value="si">Sinhala</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>
            </div>
          </SettingsSection>
        )}

        {/* Business Rules Tab */}
        {activeTab === 'business' && (
          <SettingsSection title="Business Rules" icon={CogIcon} settingsType="business">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={businessRules.autoApprovalEnabled}
                      onChange={(e) => handleInputChange('business', 'autoApprovalEnabled', e.target.checked)}
                      className="mr-2"
                    />
                    Enable Auto-Approval for Bookings
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Automatically approve bookings without manual review
                  </p>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={businessRules.depositRequired}
                      onChange={(e) => handleInputChange('business', 'depositRequired', e.target.checked)}
                      className="mr-2"
                    />
                    Require Deposit for Bookings
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Advance Booking (hours)
                  </label>
                  <input
                    type="number"
                    value={businessRules.minAdvanceBookingHours}
                    onChange={(e) => handleInputChange('business', 'minAdvanceBookingHours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Advance Booking (days)
                  </label>
                  <input
                    type="number"
                    value={businessRules.maxAdvanceBookingDays}
                    onChange={(e) => handleInputChange('business', 'maxAdvanceBookingDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Concurrent Bookings
                  </label>
                  <input
                    type="number"
                    value={businessRules.maxConcurrentBookings}
                    onChange={(e) => handleInputChange('business', 'maxConcurrentBookings', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    value={businessRules.earliestBookingTime}
                    onChange={(e) => handleInputChange('business', 'earliestBookingTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latest Booking Time
                  </label>
                  <input
                    type="time"
                    value={businessRules.latestBookingTime}
                    onChange={(e) => handleInputChange('business', 'latestBookingTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {businessRules.depositRequired && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit Amount (LKR)
                  </label>
                  <input
                    type="number"
                    value={businessRules.depositAmount}
                    onChange={(e) => handleInputChange('business', 'depositAmount', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Policy
                </label>
                <textarea
                  value={businessRules.cancellationPolicy}
                  onChange={(e) => handleInputChange('business', 'cancellationPolicy', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Policy
                </label>
                <textarea
                  value={businessRules.refundPolicy}
                  onChange={(e) => handleInputChange('business', 'refundPolicy', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </SettingsSection>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <SettingsSection title="Notification Settings" icon={BellIcon} settingsType="notifications">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                      className="mr-2"
                    />
                    Email Notifications
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                      className="mr-2"
                    />
                    SMS Notifications
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                      className="mr-2"
                    />
                    Push Notifications
                  </label>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Alert Types</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.newBookingAlerts}
                        onChange={(e) => handleInputChange('notifications', 'newBookingAlerts', e.target.checked)}
                        className="mr-2"
                      />
                      New Booking Alerts
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.cancellationAlerts}
                        onChange={(e) => handleInputChange('notifications', 'cancellationAlerts', e.target.checked)}
                        className="mr-2"
                      />
                      Cancellation Alerts
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.paymentAlerts}
                        onChange={(e) => handleInputChange('notifications', 'paymentAlerts', e.target.checked)}
                        className="mr-2"
                      />
                      Payment Alerts
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.maintenanceAlerts}
                        onChange={(e) => handleInputChange('notifications', 'maintenanceAlerts', e.target.checked)}
                        className="mr-2"
                      />
                      Maintenance Alerts
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Report Frequency</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.dailyReports}
                        onChange={(e) => handleInputChange('notifications', 'dailyReports', e.target.checked)}
                        className="mr-2"
                      />
                      Daily Reports
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.weeklyReports}
                        onChange={(e) => handleInputChange('notifications', 'weeklyReports', e.target.checked)}
                        className="mr-2"
                      />
                      Weekly Reports
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.monthlyReports}
                        onChange={(e) => handleInputChange('notifications', 'monthlyReports', e.target.checked)}
                        className="mr-2"
                      />
                      Monthly Reports
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <SettingsSection title="Payment Settings" icon={CreditCardIcon} settingsType="payment">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={paymentSettings.stripeEnabled}
                      onChange={(e) => handleInputChange('payment', 'stripeEnabled', e.target.checked)}
                      className="mr-2"
                    />
                    Enable Stripe Payments
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={paymentSettings.paypalEnabled}
                      onChange={(e) => handleInputChange('payment', 'paypalEnabled', e.target.checked)}
                      className="mr-2"
                    />
                    Enable PayPal Payments
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={paymentSettings.bankTransferEnabled}
                      onChange={(e) => handleInputChange('payment', 'bankTransferEnabled', e.target.checked)}
                      className="mr-2"
                    />
                    Enable Bank Transfer
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={paymentSettings.cashPaymentEnabled}
                      onChange={(e) => handleInputChange('payment', 'cashPaymentEnabled', e.target.checked)}
                      className="mr-2"
                    />
                    Enable Cash Payments
                  </label>
                </div>
              </div>

              {paymentSettings.stripeEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stripe Publishable Key
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.stripePublishableKey}
                      onChange={(e) => handleInputChange('payment', 'stripePublishableKey', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="pk_test_..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stripe Secret Key
                    </label>
                    <input
                      type="password"
                      value={paymentSettings.stripeSecretKey}
                      onChange={(e) => handleInputChange('payment', 'stripeSecretKey', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="sk_test_..."
                    />
                  </div>
                </div>
              )}

              {paymentSettings.paypalEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PayPal Client ID
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.paypalClientId}
                      onChange={(e) => handleInputChange('payment', 'paypalClientId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PayPal Secret
                    </label>
                    <input
                      type="password"
                      value={paymentSettings.paypalSecret}
                      onChange={(e) => handleInputChange('payment', 'paypalSecret', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}

              {paymentSettings.bankTransferEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Account Details
                  </label>
                  <textarea
                    value={paymentSettings.bankAccountDetails}
                    onChange={(e) => handleInputChange('payment', 'bankAccountDetails', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Bank Name&#10;Account Number&#10;Branch&#10;Account Holder Name"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={paymentSettings.commissionRate}
                    onChange={(e) => handleInputChange('payment', 'commissionRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={paymentSettings.taxRate}
                    onChange={(e) => handleInputChange('payment', 'taxRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </SettingsSection>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <SettingsSection title="Security Settings" icon={ShieldCheckIcon} settingsType="security">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                      className="mr-2"
                    />
                    Enable Two-Factor Authentication
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Require additional verification for login
                  </p>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={securitySettings.auditLogging}
                      onChange={(e) => handleInputChange('security', 'auditLogging', e.target.checked)}
                      className="mr-2"
                    />
                    Enable Audit Logging
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Log all system activities for security
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Expiry (days)
                  </label>
                  <input
                    type="number"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) => handleInputChange('security', 'passwordExpiry', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={securitySettings.loginAttempts}
                    onChange={(e) => handleInputChange('security', 'loginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IP Whitelist (optional)
                </label>
                <textarea
                  value={securitySettings.ipWhitelist}
                  onChange={(e) => handleInputChange('security', 'ipWhitelist', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter IP addresses, one per line&#10;192.168.1.1&#10;10.0.0.1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to allow all IP addresses
                </p>
              </div>
            </div>
          </SettingsSection>
        )}
      </div>
    </div>
  );
}

