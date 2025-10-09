import apiService from "./apiService";

class PortService {
  // Get all ports with pagination and filtering
  async getAllPorts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/ports?${queryString}` : "/api/ports";
    return await apiService.get(endpoint);
  }

  // Get a single port by ID
  async getPortById(id) {
    return await apiService.get(`/api/ports/${id}`);
  }

  // Get ports by country
  async getPortsByCountry(countryId) {
    return await apiService.get(`/api/ports/country/${countryId}`);
  }

  // Create a new port
  async createPort(portData) {
    return await apiService.post("/api/ports", portData);
  }

  // Update an existing port
  async updatePort(id, portData) {
    return await apiService.put(`/api/ports/${id}`, portData);
  }

  // Delete a port
  async deletePort(id) {
    return await apiService.delete(`/api/ports/${id}`);
  }
}

// Create and export a singleton instance
const portService = new PortService();
export default portService;
