import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import {
  Layout,
  Menu,
  Breadcrumb,
  Avatar,
  Dropdown,
  Button,
  Typography,
  Tag,
  Space,
  Select,
  theme,
} from "antd";
import {
  DashboardOutlined,
  TruckOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DatabaseOutlined,
  ContainerOutlined,
  FileTextOutlined,
  UsergroupAddOutlined,
  SafetyOutlined,
  BarChartOutlined,
  SwapOutlined,
  GlobalOutlined,
  ApartmentOutlined,
  ShopOutlined,
  CarOutlined,
  RocketOutlined,
  CalendarOutlined,
  DollarOutlined,
  HomeOutlined,
  InboxOutlined,
  BuildOutlined,
  BankOutlined,
  FundOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { user, activeRole, logout, switchRole, getAvailableRoles } = useAuth();
  const location = useLocation();

  // Fetch available roles when component mounts
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getAvailableRoles();
        setAvailableRoles(rolesData.roles || []);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };

    if (user) {
      fetchRoles();
    }
  }, [user, getAvailableRoles]);

  console.log("###", availableRoles, activeRole);
  // Get menu items based on role
  const getMenuItems = (activeRole) => {
    const baseItems = [
      {
        key: "dashboard",
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard">Dashboard</Link>,
      },
    ];

    const roleItems = {
      ADMIN: [
        ...baseItems,
        {
          key: "bookings",
          icon: <TruckOutlined />,
          label: <Link to="/bookings">Bookings</Link>,
        },
        {
          key: "customers",
          icon: <TeamOutlined />,
          label: <Link to="/customers">Customers</Link>,
        },

        {
          key: "master",
          icon: <DatabaseOutlined />,
          label: "Master",
          children: [
            {
              key: "ports",
              icon: <GlobalOutlined />,
              label: <Link to="/ports">Ports</Link>,
            },
            {
              key: "terminals",
              icon: <ApartmentOutlined />,
              label: <Link to="/terminals">Terminals</Link>,
            },
            {
              key: "agents",
              icon: <ShopOutlined />,
              label: <Link to="/agents">Agents</Link>,
            },
            {
              key: "cargo",
              icon: <InboxOutlined />,
              label: <Link to="/cargo">Cargo</Link>,
            },
            {
              key: "operators",
              icon: <BuildOutlined />,
              label: <Link to="/operators">Operators</Link>,
            },
            {
              key: "vessels",
              icon: <RocketOutlined />,
              label: <Link to="/vessels">Vessels</Link>,
            },
            {
              key: "vessel-schedules",
              icon: <CalendarOutlined />,
              label: <Link to="/vessel-schedules">Vessel Schedules</Link>,
            },
            {
              key: "charges",
              icon: <DollarOutlined />,
              label: <Link to="/charges">Charges</Link>,
            },
            {
              key: "depots",
              icon: <HomeOutlined />,
              label: <Link to="/depots">Depots</Link>,
            },
            {
              key: "commodities",
              icon: <CarOutlined />,
              label: <Link to="/commodities">Commodities</Link>,
            },
            {
              key: "container-types",
              icon: <ContainerOutlined />,
              label: <Link to="/container-types">Container Types</Link>,
            },
            {
              key: "bank-accounts",
              icon: <BankOutlined />,
              label: <Link to="/bank-accounts">Bank Accounts</Link>,
            },
            {
              key: "tariffs",
              icon: <FundOutlined />,
              label: <Link to="/tariffs">Tariffs</Link>,
            },
            {
              key: "currency-exchange-rates",
              icon: <SwapOutlined />,
              label: (
                <Link to="/currency-exchange-rates">
                  Currency Exchange Rates
                </Link>
              ),
            },
          ],
        },
        {
          key: "admin",
          icon: <SafetyOutlined />,
          label: "Administration",
          children: [
            {
              key: "users",
              icon: <UserOutlined />,
              label: <Link to="/users">User Management</Link>,
            },
            {
              key: "roles",
              icon: <UsergroupAddOutlined />,
              label: <Link to="/roles">Role Management</Link>,
            },
            {
              key: "activity-logs",
              icon: <FileTextOutlined />,
              label: <Link to="/activity-logs">Activity Logs</Link>,
            },
          ],
        },
        {
          key: "settings",
          icon: <SettingOutlined />,
          label: <Link to="/settings">Settings</Link>,
        },
      ],
      CUSTOMER: [
        ...baseItems,
        {
          key: "bookings",
          icon: <TruckOutlined />,
          label: <Link to="/bookings">My Bookings</Link>,
        },
      ],
      SALES: [
        ...baseItems,
        {
          key: "bookings",
          icon: <TruckOutlined />,
          label: <Link to="/bookings">Bookings</Link>,
        },
        {
          key: "customers",
          icon: <TeamOutlined />,
          label: <Link to="/customers">Customers</Link>,
        },
        {
          key: "reports",
          icon: <BarChartOutlined />,
          label: <Link to="/reports">Reports</Link>,
        },
      ],
    };

    return roleItems[activeRole] || baseItems;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleRoleSwitch = async (roleName) => {
    try {
      await switchRole(roleName);
      // Refresh available roles after switching
      const rolesData = await getAvailableRoles();
      setAvailableRoles(rolesData.roles || []);
    } catch (error) {
      console.error("Role switch failed:", error);
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname.split("/")[1];
    return path || "dashboard";
  };

  // Generate breadcrumb items based on current route
  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbItems = [{ title: "Home", href: "/dashboard" }];

    if (pathSegments.length > 0) {
      pathSegments.forEach((segment, index) => {
        const title = segment.charAt(0).toUpperCase() + segment.slice(1);
        const href = "/" + pathSegments.slice(0, index + 1).join("/");
        breadcrumbItems.push({ title, href });
      });
    }

    return breadcrumbItems;
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #303030",
          }}
        >
          <Title level={4} style={{ color: "#fff", margin: 0 }}>
            {collapsed
              ? user.tenant?.name[0].toUpperCase() || "N"
              : user.tenant?.name || "NVOCC"}
          </Title>
        </div>

        {activeRole && (
          <div style={{ padding: "16px", borderBottom: "1px solid #303030" }}>
            <Tag color="blue" style={{ width: "100%", textAlign: "center" }}>
              {collapsed
                ? activeRole.charAt(0)
                : availableRoles.find((role) => role.name === activeRole)
                    ?.displayName || activeRole.replace("_", " ")}
            </Tag>
          </div>
        )}

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          selectedKeys={[getSelectedKey()]}
          items={getMenuItems(activeRole)}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "100%",
              paddingRight: "24px",
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />

            <Space size="large">
              {/* Role Switcher */}
              {availableRoles.length > 1 && (
                <Space>
                  <SwapOutlined />
                  <Select
                    value={activeRole}
                    onChange={handleRoleSwitch}
                    style={{ minWidth: 140 }}
                    size="small"
                    bordered={false}
                    placeholder="Switch Role"
                  >
                    {availableRoles.map((role) => (
                      <Option key={role.name} value={role.name}>
                        {role.displayName}
                      </Option>
                    ))}
                  </Select>
                </Space>
              )}

              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow={{ pointAtCenter: true }}
              >
                <Space style={{ cursor: "pointer", padding: "8px" }}>
                  <Avatar icon={<UserOutlined />} />
                  <Text>{user?.name || "User"}</Text>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb
            items={getBreadcrumbItems()}
            style={{ margin: "16px 0" }}
          />
          <Content
            style={{
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
