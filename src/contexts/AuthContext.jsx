import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

// Role types from the Prisma schema
export const ROLE_TYPES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  PORT: 'PORT',
  DEPOT: 'DEPOT',
  SALES: 'SALES',
  MASTER_PORT: 'MASTER_PORT',
  HR: 'HR'
};

// User status types
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
};

// Initial auth state
const initialState = {
  user: null,
  roles: [],
  activeRole: null,
  permissions: [],
  isAuthenticated: false,
  loading: true,
  token: null,
  session: null
};

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SWITCH_ROLE: 'SWITCH_ROLE',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
  SET_SESSION: 'SET_SESSION'
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        roles: action.payload.user.roles || [],
        activeRole: action.payload.user.activeRole,
        permissions: action.payload.user.permissions || [],
        isAuthenticated: true,
        token: action.payload.accessToken,
        session: action.payload.session,
        loading: false
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        loading: false
      };
    case AUTH_ACTIONS.SWITCH_ROLE:
      return {
        ...state,
        user: action.payload.user,
        activeRole: action.payload.user.activeRole,
        permissions: action.payload.user.permissions || []
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case AUTH_ACTIONS.SET_SESSION:
      return {
        ...state,
        session: action.payload
      };
    default:
      return state;
  }
}

// Create auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Validate token with backend
        const response = await authService.checkAuth();
        
        if (response.success) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              accessToken: token,
              session: response.data.session
            }
          });
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('authToken');
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Session check failed:', error);
      localStorage.removeItem('authToken');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await authService.login(email, password);

      if (response.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.accessToken);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            accessToken: response.data.accessToken,
            session: response.data.session
          }
        });

        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear localStorage and state
      localStorage.removeItem('authToken');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const switchRole = async (roleName) => {
    try {
      const response = await authService.switchRole(roleName);

      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.SWITCH_ROLE,
          payload: {
            user: response.data.user
          }
        });

        return { success: true };
      } else {
        throw new Error(response.message || 'Role switch failed');
      }
    } catch (error) {
      throw new Error(error.message || 'Role switch failed');
    }
  };

  const getAvailableRoles = async () => {
    try {
      const response = await authService.getAvailableRoles();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      return { roles: [], activeRole: null };
    }
  };

  const getPermissions = async () => {
    try {
      const response = await authService.getPermissions();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      return { permissions: [], activeRole: null };
    }
  };

  const getProfile = async () => {
    try {
      const response = await authService.getProfile();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();

      if (response.success) {
        localStorage.setItem('authToken', response.data.accessToken);
        return response.data;
      } else {
        throw new Error(response.message || 'Token refresh failed');
      }
    } catch (error) {
      // If refresh fails, logout user
      localStorage.removeItem('authToken');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      throw error;
    }
  };

  const hasPermission = (permission) => {
    if (!state.permissions || state.permissions.length === 0) return false;
    
    // Admin role typically has all permissions
    if (state.activeRole === ROLE_TYPES.ADMIN) return true;
    
    // Check for wildcard permission
    if (state.permissions.includes('*')) return true;
    
    // Check exact permission match
    if (state.permissions.includes(permission)) return true;
    
    // Check permission patterns (e.g., "users.*" matches "users.create", "users.read", etc.)
    return state.permissions.some(p => {
      if (p.endsWith('.*')) {
        const basePermission = p.slice(0, -2);
        return permission.startsWith(basePermission + '.');
      }
      return false;
    });
  };

  const hasRole = (roleName) => {
    return state.roles && state.roles.includes(roleName);
  };

  const isActiveRole = (roleName) => {
    return state.activeRole === roleName;
  };

  const hasAnyRole = (roleNames) => {
    if (!Array.isArray(roleNames)) return false;
    return roleNames.some(role => hasRole(role));
  };

  const hasAllRoles = (roleNames) => {
    if (!Array.isArray(roleNames)) return false;
    return roleNames.every(role => hasRole(role));
  };

  const hasAnyPermission = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccess = (resource, action = 'read') => {
    const permission = `${resource}.${action}`;
    return hasPermission(permission);
  };

  const getResourceAccess = (resource) => {
    return {
      create: hasPermission(`${resource}.create`),
      read: hasPermission(`${resource}.read`),
      update: hasPermission(`${resource}.update`),
      delete: hasPermission(`${resource}.delete`),
      view: hasPermission(`${resource}.view`) || hasPermission(`${resource}.read`),
      manage: hasPermission(`${resource}.manage`) || hasPermission(`${resource}.*`)
    };
  };

  // Get role display name
  const getRoleDisplayName = (roleName) => {
    return roleName
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const value = {
    ...state,
    login,
    logout,
    switchRole,
    hasPermission,
    hasRole,
    isActiveRole,
    getRoleDisplayName,
    getAvailableRoles,
    getPermissions,
    getProfile,
    refreshToken,
    actions: AUTH_ACTIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
