import apiService from './apiService';

// Auth service for handling authentication-related API calls
class AuthService {
  // Login user
  async login(email, password) {
    return apiService.post('/api/auth/login', { email, password }, { skipAuth: true });
  }

  // Logout user
  async logout() {
    return apiService.post('/api/auth/logout');
  }

  // Switch user role
  async switchRole(role) {
    return apiService.post('/api/auth/switch-role', { role });
  }

  // Refresh access token
  async refreshToken() {
    return apiService.post('/api/auth/refresh-token', {}, { skipAuth: true });
  }

  // Get user profile
  async getProfile() {
    return apiService.get('/api/auth/profile');
  }

  // Get available roles
  async getAvailableRoles() {
    return apiService.get('/api/auth/roles');
  }

  // Get permissions
  async getPermissions() {
    return apiService.get('/api/auth/permissions');
  }

  // Check authentication status
  async checkAuth() {
    return apiService.get('/api/auth/check');
  }

  // Register user (if needed)
  async register(userData) {
    return apiService.post('/api/auth/register', userData, { skipAuth: true });
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
