import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./components/auth/LoginPage";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Customers from "./pages/Customers";
import { ConfigProvider } from "antd";
import { Result, Button } from "antd";
import "./App.css";

// Ant Design theme configuration
const theme = {
  token: {
    colorPrimary: "#1677ff",
    borderRadius: 6,
    colorBgContainer: "#fff",
  },
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />

                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute requirePermission="dashboard.view">
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="bookings" element={<Bookings />} />
                <Route path="customers" element={<Customers />} />

                {/* Placeholder routes for other pages */}
                <Route
                  path="ports"
                  element={
                    <Result
                      status="info"
                      title="Ports Management"
                      subTitle="This page is under development."
                      extra={
                        <Button type="primary" href="/dashboard">
                          Go to Dashboard
                        </Button>
                      }
                    />
                  }
                />

                <Route
                  path="depots"
                  element={
                    <Result
                      status="info"
                      title="Depots Management"
                      subTitle="This page is under development."
                      extra={
                        <Button type="primary" href="/dashboard">
                          Go to Dashboard
                        </Button>
                      }
                    />
                  }
                />

                <Route
                  path="users"
                  element={
                    <ProtectedRoute requirePermission="users:read">
                      <Result
                        status="info"
                        title="User Management"
                        subTitle="This page is under development."
                        extra={
                          <Button type="primary" href="/dashboard">
                            Go to Dashboard
                          </Button>
                        }
                      />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="roles"
                  element={
                    <ProtectedRoute requirePermission="roles:read">
                      <Result
                        status="info"
                        title="Role Management"
                        subTitle="This page is under development."
                        extra={
                          <Button type="primary" href="/dashboard">
                            Go to Dashboard
                          </Button>
                        }
                      />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="activity-logs"
                  element={
                    <ProtectedRoute requirePermission="logs:read">
                      <Result
                        status="info"
                        title="Activity Logs"
                        subTitle="This page is under development."
                        extra={
                          <Button type="primary" href="/dashboard">
                            Go to Dashboard
                          </Button>
                        }
                      />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="settings"
                  element={
                    <Result
                      status="info"
                      title="Settings"
                      subTitle="This page is under development."
                      extra={
                        <Button type="primary" href="/dashboard">
                          Go to Dashboard
                        </Button>
                      }
                    />
                  }
                />
              </Route>

              {/* Fallback route */}
              <Route
                path="*"
                element={
                  <Result
                    status="404"
                    title="404"
                    subTitle="Sorry, the page you visited does not exist."
                    extra={
                      <Button type="primary" href="/dashboard">
                        Back Home
                      </Button>
                    }
                  />
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
