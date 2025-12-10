import apiService from "./apiService";

class VesselScheduleService {
  // Get all vessel schedules with pagination and filtering
  async getAllVesselSchedules(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/vessel-schedules?${queryString}`
      : "/api/vessel-schedules";
    return await apiService.get(endpoint);
  }

  // Get a single vessel schedule by ID
  async getVesselScheduleById(id) {
    return await apiService.get(`/api/vessel-schedules/${id}`);
  }

  // Get vessel schedules by vessel
  async getVesselSchedulesByVessel(vesselId) {
    return await apiService.get(`/api/vessel-schedules/vessel/${vesselId}`);
  }

  // Get vessel schedules by pickup terminal
  async getVesselSchedulesByPickupTerminal(terminalId) {
    return await apiService.get(
      `/api/vessel-schedules/pickup-terminal/${terminalId}`
    );
  }

  // Get vessel schedules by next port terminal
  async getVesselSchedulesByNextPortTerminal(terminalId) {
    return await apiService.get(
      `/api/vessel-schedules/next-port-terminal/${terminalId}`
    );
  }

  // Get vessel schedules by voyage
  async getVesselSchedulesByVoyage(voyage) {
    return await apiService.get(`/api/vessel-schedules/voyage/${voyage}`);
  }

  // Create a new vessel schedule
  async createVesselSchedule(vesselScheduleData) {
    return await apiService.post("/api/vessel-schedules", vesselScheduleData);
  }

  // Update an existing vessel schedule
  async updateVesselSchedule(id, vesselScheduleData) {
    return await apiService.put(
      `/api/vessel-schedules/${id}`,
      vesselScheduleData
    );
  }

  // Delete a vessel schedule
  async deleteVesselSchedule(id) {
    return await apiService.delete(`/api/vessel-schedules/${id}`);
  }
}

// Create and export a singleton instance
const vesselScheduleService = new VesselScheduleService();
export default vesselScheduleService;
