import apiService from "./apiService";

class ChargeService {
  // Get all charges with pagination and filtering
  async getAllCharges(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/charges?${queryString}`
      : "/api/charges";
    return await apiService.get(endpoint);
  }

  // Get a single charge by ID
  async getChargeById(id) {
    return await apiService.get(`/api/charges/${id}`);
  }

  // Create a new charge
  async createCharge(chargeData) {
    return await apiService.post("/api/charges", chargeData);
  }

  // Update an existing charge
  async updateCharge(id, chargeData) {
    return await apiService.put(`/api/charges/${id}`, chargeData);
  }

  // Delete a charge
  async deleteCharge(id) {
    return await apiService.delete(`/api/charges/${id}`);
  }
}

// Create and export a singleton instance
const chargeService = new ChargeService();
export default chargeService;
