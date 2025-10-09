import apiService from "./apiService";

class CountryService {
  // Get all countries
  async getAllCountries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/countries?${queryString}`
      : "/api/countries";
    return await apiService.get(endpoint);
  }

  // Get a single country by ID
  async getCountryById(id) {
    return await apiService.get(`/api/countries/${id}`);
  }
}

// Create and export a singleton instance
const countryService = new CountryService();
export default countryService;
