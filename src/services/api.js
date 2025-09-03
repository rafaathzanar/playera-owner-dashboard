const API_BASE_URL = "http://localhost:8080/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem("authToken");
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    console.log("Setting auth token:", token ? "Token received" : "No token");
    localStorage.setItem("authToken", token);
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    localStorage.removeItem("authToken");
  }

  // Get headers with auth token
  getHeaders() {
    const token = this.getAuthToken();
    console.log(
      "Getting headers with token:",
      token ? "Token exists" : "No token"
    );
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Generic request method
  async request(endpoint, method = "GET", body = null) {
    try {
      const headers = this.getHeaders();
      const url = `${this.baseURL}${endpoint}`;

      console.log("API Request:", {
        url,
        method,
        headers,
        body,
      });

      const options = {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) }),
      };

      const response = await fetch(url, options);

      console.log("API Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, remove it
          this.removeAuthToken();
          throw new Error("Authentication expired. Please login again.");
        }

        const errorData = await response.json().catch(() => ({}));
        console.log("Error response data:", errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication APIs
  async login(email, password) {
    console.log("Login attempt with:", { email, password });
    const response = await this.request("/auth/login", "POST", {
      email,
      password,
    });

    console.log("Login response:", response);

    if (response.token) {
      this.setAuthToken(response.token);
    }

    return response;
  }

  async register(userData) {
    return await this.request("/auth/register", "POST", userData);
  }

  async getCurrentUser() {
    return await this.request("/auth/me");
  }

  // Venue Management APIs
  async getVenues() {
    return await this.request("/venues");
  }

  async getVenueById(id) {
    return await this.request(`/venues/${id}`);
  }

  async createVenue(venueData) {
    return await this.request("/venues", "POST", venueData);
  }

  async updateVenue(id, venueData) {
    return await this.request(`/venues/${id}`, "PUT", venueData);
  }

  async deleteVenue(id) {
    return await this.request(`/venues/${id}`, "DELETE");
  }

  // Get venue by owner ID (each owner has only one venue)
  async getVenueByOwner(ownerId) {
    return await this.request(`/venues/owner/${ownerId}/venue`);
  }

  // Get venues by owner ID (legacy method - returns list with single venue)
  async getVenuesByOwner(ownerId) {
    return await this.request(`/venues/owner/${ownerId}`);
  }

  // Analytics API methods
  async getVenueAnalytics(venueId, dateRange = "month") {
    return await this.request(
      `/analytics/venue/${venueId}?dateRange=${dateRange}`
    );
  }

  async getVenueRevenueAnalytics(venueId, dateRange = "month") {
    return await this.request(
      `/analytics/venue/${venueId}/revenue?dateRange=${dateRange}`
    );
  }

  async getVenueOccupancyAnalytics(venueId, dateRange = "month") {
    return await this.request(
      `/analytics/venue/${venueId}/occupancy?dateRange=${dateRange}`
    );
  }

  // Court Management APIs
  async getCourts(venueId) {
    return await this.request(`/courts/venue/${venueId}`);
  }

  async createCourt(courtData) {
    return await this.request("/courts", "POST", courtData);
  }

  async getCourtById(id) {
    return await this.request(`/courts/${id}`);
  }

  async updateCourt(id, courtData) {
    return await this.request(`/courts/${id}`, "PUT", courtData);
  }

  async deleteCourt(id) {
    return await this.request(`/courts/${id}`, "DELETE");
  }

  async getCourtsByVenue(venueId) {
    return await this.request(`/courts/venue/${venueId}`);
  }

  // Equipment Management APIs
  async getEquipment(venueId) {
    return await this.request(`/equipment/venue/${venueId}`);
  }

  async createEquipment(equipmentData) {
    return await this.request("/equipment", "POST", equipmentData);
  }

  async updateEquipment(id, equipmentData) {
    return await this.request(`/equipment/${id}`, "PUT", equipmentData);
  }

  async deleteEquipment(id) {
    return await this.request(`/equipment/${id}`, "DELETE");
  }

  // Booking Management APIs
  async getBookings(venueId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = venueId
      ? `/bookings/venue/${venueId}?${queryParams}`
      : `/bookings?${queryParams}`;
    return await this.request(endpoint);
  }

  async updateBookingStatus(id, status) {
    return await this.request(
      `/bookings/${id}/status?status=${status}`,
      "PATCH"
    );
  }

  // Dashboard Analytics APIs
  async getDashboardSummary(ownerId, startDate, endDate) {
    return await this.request(
      `/owner-dashboard/summary?ownerId=${ownerId}&start=${startDate}&end=${endDate}`
    );
  }

  async getVenueAnalytics(venueId, dateRange = "month") {
    return await this.request(
      `/analytics/venue/${venueId}?dateRange=${dateRange}`
    );
  }

  // Payment APIs
  async getPayments(venueId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = venueId
      ? `/payments/venue/${venueId}?${queryParams}`
      : `/payments?${queryParams}`;
    return await this.request(endpoint);
  }

  // Review Management APIs
  async getReviews(venueId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = venueId
      ? `/reviews/venue/${venueId}?${queryParams}`
      : `/reviews?${queryParams}`;
    return await this.request(endpoint);
  }

  async respondToReview(reviewId, response) {
    return await this.request(`/reviews/${reviewId}/respond`, "POST", {
      response,
    });
  }

  // Time Slot Management APIs
  async getTimeSlotsForDate(courtId, date) {
    return await this.request(`/timeslots/court/${courtId}/date/${date}`);
  }

  async updateDynamicPricing(courtId, pricingSettings) {
    return await this.request(
      `/courts/${courtId}/dynamic-pricing`,
      "POST",
      pricingSettings
    );
  }

  async getDynamicPricingSettings(courtId) {
    return await this.request(`/courts/${courtId}/dynamic-pricing`);
  }

  async getAllTimeSlotsForDate(courtId, date) {
    return await this.request(`/timeslots/court/${courtId}/date/${date}/all`);
  }

  async getTimeSlotsForDateRange(courtId, startDate, endDate) {
    return await this.request(
      `/timeslots/court/${courtId}/range?startDate=${startDate}&endDate=${endDate}`
    );
  }

  async blockTimeSlot(
    courtId,
    date,
    startTime,
    endTime,
    reason,
    isMaintenance = false
  ) {
    const params = new URLSearchParams({
      date: date,
      startTime: startTime,
      endTime: endTime,
      reason: reason,
      isMaintenance: isMaintenance,
    });
    return await this.request(
      `/timeslots/court/${courtId}/block?${params}`,
      "POST"
    );
  }

  async blockRecurringTimeSlots(
    courtId,
    startDate,
    endDate,
    startTime,
    endTime,
    reason,
    isMaintenance,
    recurringDays
  ) {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate,
      startTime: startTime,
      endTime: endTime,
      reason: reason,
      isMaintenance: isMaintenance,
    });

    // Add recurring days as separate parameters
    recurringDays.forEach((day) => params.append("recurringDays", day));

    return await this.request(
      `/timeslots/court/${courtId}/block-recurring?${params}`,
      "POST"
    );
  }

  async unblockTimeSlot(courtId, date, startTime, endTime) {
    const params = new URLSearchParams({
      date: date,
      startTime: startTime,
      endTime: endTime,
    });
    return await this.request(
      `/timeslots/court/${courtId}/unblock?${params}`,
      "DELETE"
    );
  }

  async generateTimeSlots(courtId, startDate, endDate) {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate,
    });
    return await this.request(
      `/timeslots/court/${courtId}/generate-slots?${params}`,
      "POST"
    );
  }

  // Logout
  async logout() {
    this.removeAuthToken();
  }
}

export default new ApiService();
