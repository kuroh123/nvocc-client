import apiService from "./apiService";

class TariffService {
  // Get all tariffs with pagination and filtering
  async getAllTariffs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/tariffs?${queryString}`
      : "/api/tariffs";
    return await apiService.get(endpoint);
  }

  // Get a single tariff by ID
  async getTariffById(id) {
    return await apiService.get(`/api/tariffs/${id}`);
  }

  // Get tariffs by container type
  async getTariffsByContainerType(containerTypeId) {
    return await apiService.get(
      `/api/tariffs/container-type/${containerTypeId}`
    );
  }

  // Get tariffs by event type
  async getTariffsByEventType(eventType) {
    return await apiService.get(`/api/tariffs/event-type/${eventType}`);
  }

  // Get tariffs by pickup agent
  async getTariffsByPickupAgent(agentId) {
    return await apiService.get(`/api/tariffs/pickup-agent/${agentId}`);
  }

  // Get tariffs by next agent
  async getTariffsByNextAgent(agentId) {
    return await apiService.get(`/api/tariffs/next-agent/${agentId}`);
  }

  // Create a new tariff
  async createTariff(tariffData) {
    return await apiService.post("/api/tariffs", tariffData);
  }

  // Update an existing tariff
  async updateTariff(id, tariffData) {
    return await apiService.put(`/api/tariffs/${id}`, tariffData);
  }

  // Delete a tariff
  async deleteTariff(id) {
    return await apiService.delete(`/api/tariffs/${id}`);
  }
}

// Create and export a singleton instance
const tariffService = new TariffService();
export default tariffService;
