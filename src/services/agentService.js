import apiService from "./apiService";

class AgentService {
  // Get all agents with pagination and filtering
  async getAllAgents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/agents?${queryString}` : "/api/agents";
    return await apiService.get(endpoint);
  }

  // Get a single agent by ID
  async getAgentById(id) {
    return await apiService.get(`/api/agents/${id}`);
  }

  // Get agents by port
  async getAgentsByPort(portId) {
    return await apiService.get(`/api/agents/port/${portId}`);
  }

  // Create a new agent
  async createAgent(agentData) {
    return await apiService.post("/api/agents", agentData);
  }

  // Update an existing agent
  async updateAgent(id, agentData) {
    return await apiService.put(`/api/agents/${id}`, agentData);
  }

  // Delete an agent
  async deleteAgent(id) {
    return await apiService.delete(`/api/agents/${id}`);
  }
}

// Create and export a singleton instance
const agentService = new AgentService();
export default agentService;
