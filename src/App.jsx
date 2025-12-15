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
import Ports from "./pages/Ports";
import { ConfigProvider } from "antd";
import { Result, Button } from "antd";
import "./App.css";
import Terminals from "./pages/Terminals";
import Depots from "./pages/Depots";
import Agents from "./pages/Agents";
import Charges from "./pages/Charges";
import Vessels from "./pages/Vessels";
import Operators from "./pages/Operators";
import Cargo from "./pages/Cargo";
import VesselSchedules from "./pages/VesselSchedules";
import Commodities from "./pages/Commodities";
import ContainerTypes from "./pages/ContainerTypes";
import BankAccounts from "./pages/BankAccounts";
import Tariffs from "./pages/Tariffs";
import CurrencyExchangeRates from "./pages/CurrencyExchangeRates";

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

                {/* Ports Management */}
                <Route
                  path="ports"
                  element={
                    <ProtectedRoute requirePermission="ports:read">
                      <Ports />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="terminals"
                  element={
                    <ProtectedRoute requirePermission="terminals:read">
                      <Terminals />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="agents"
                  element={
                    <ProtectedRoute requirePermission="agents:read">
                      <Agents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="charges"
                  element={
                    <ProtectedRoute requirePermission="charges:read">
                      <Charges />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="cargo"
                  element={
                    <ProtectedRoute requirePermission="cargo:read">
                      <Cargo />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="operators"
                  element={
                    <ProtectedRoute requirePermission="operators:read">
                      <Operators />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="vessels"
                  element={
                    <ProtectedRoute requirePermission="vessels:read">
                      <Vessels />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="vessel-schedules"
                  element={
                    <ProtectedRoute requirePermission="vessel-schedules:read">
                      <VesselSchedules />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="depots"
                  element={
                    <ProtectedRoute requirePermission="terminals:read">
                      <Depots />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="commodities"
                  element={
                    <ProtectedRoute requirePermission="commodities:read">
                      <Commodities />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="container-types"
                  element={
                    <ProtectedRoute requirePermission="container-types:read">
                      <ContainerTypes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="bank-accounts"
                  element={
                    <ProtectedRoute requirePermission="bank-accounts:read">
                      <BankAccounts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="tariffs"
                  element={
                    <ProtectedRoute requirePermission="tariffs:read">
                      <Tariffs />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="currency-exchange-rates"
                  element={
                    <ProtectedRoute requirePermission="currency-exchange-rates:read">
                      <CurrencyExchangeRates />
                    </ProtectedRoute>
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
