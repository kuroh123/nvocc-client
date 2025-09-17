import apiService from "./apiService";

class TerminalService {
  // Get all terminals with pagination and filtering
  async getAllTerminals(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/terminals?${queryString}`
      : "/api/terminals";
    return await apiService.get(endpoint);
  }

  // Get a single terminal by ID
  async getTerminalById(id) {
    return await apiService.get(`/api/terminals/${id}`);
  }

  // Get terminals by port
  async getTerminalsByPort(portId) {
    return await apiService.get(`/api/terminals/port/${portId}`);
  }

  // Create a new terminal
  async createTerminal(terminalData) {
    return await apiService.post("/api/terminals", terminalData);
  }

  // Update an existing terminal
  async updateTerminal(id, terminalData) {
    return await apiService.put(`/api/terminals/${id}`, terminalData);
  }

  // Delete a terminal
  async deleteTerminal(id) {
    return await apiService.delete(`/api/terminals/${id}`);
  }
}

// Create and export a singleton instance
const terminalService = new TerminalService();
export default terminalService;
