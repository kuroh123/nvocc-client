import apiService from "./apiService";

class BankAccountService {
  // Get all bank accounts with pagination and filtering
  async getAllBankAccounts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/bank-accounts?${queryString}`
      : "/api/bank-accounts";
    return await apiService.get(endpoint);
  }

  // Get a single bank account by ID
  async getBankAccountById(id) {
    return await apiService.get(`/api/bank-accounts/${id}`);
  }

  // Get bank accounts by agent
  async getBankAccountsByAgent(agentId) {
    return await apiService.get(`/api/bank-accounts/agent/${agentId}`);
  }

  // Get bank accounts by country
  async getBankAccountsByCountry(countryId) {
    return await apiService.get(`/api/bank-accounts/country/${countryId}`);
  }

  // Create a new bank account
  async createBankAccount(bankAccountData) {
    return await apiService.post("/api/bank-accounts", bankAccountData);
  }

  // Update an existing bank account
  async updateBankAccount(id, bankAccountData) {
    return await apiService.put(`/api/bank-accounts/${id}`, bankAccountData);
  }

  // Delete a bank account
  async deleteBankAccount(id) {
    return await apiService.delete(`/api/bank-accounts/${id}`);
  }
}

// Create and export a singleton instance
const bankAccountService = new BankAccountService();
export default bankAccountService;
