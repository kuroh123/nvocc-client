import React from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  Typography,
  Tag,
  Timeline,
  Button,
  Space,
  Divider,
} from "antd";
import {
  TruckOutlined,
  TeamOutlined,
  DollarOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  SearchOutlined,
  UserAddOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const { user, activeRole } = useAuth();
  console.log("$$$", user, activeRole);

  // Mock data - replace with actual API calls
  const stats = [
    {
      title: "Total Bookings",
      value: 2345,
      precision: 0,
      valueStyle: { color: "#1677ff" },
      prefix: <TruckOutlined />,
      suffix: <ArrowUpOutlined style={{ color: "#52c41a" }} />,
      change: 12,
    },
    {
      title: "Active Shipments",
      value: 856,
      precision: 0,
      valueStyle: { color: "#52c41a" },
      prefix: <TruckOutlined />,
      suffix: <ArrowUpOutlined style={{ color: "#52c41a" }} />,
      change: 8,
    },
    {
      title: "Total Customers",
      value: 1203,
      precision: 0,
      valueStyle: { color: "#722ed1" },
      prefix: <TeamOutlined />,
      suffix: <ArrowUpOutlined style={{ color: "#52c41a" }} />,
      change: 23,
    },
    {
      title: "Revenue",
      value: 2.4,
      precision: 1,
      valueStyle: { color: "#fa8c16" },
      prefix: <DollarOutlined />,
      suffix: <ArrowDownOutlined style={{ color: "#ff4d4f" }} />,
      change: -2,
      formatter: (value) => `$${value}M`,
    },
  ];

  const recentActivities = [
    {
      color: "blue",
      children: (
        <div>
          <Text strong>New booking created</Text>
          <div>
            <Text type="secondary">by John Smith</Text>
            <Text type="secondary" style={{ float: "right" }}>
              2 minutes ago
            </Text>
          </div>
        </div>
      ),
    },
    {
      color: "green",
      children: (
        <div>
          <Text strong>Shipment status updated</Text>
          <div>
            <Text type="secondary">by Sarah Johnson</Text>
            <Text type="secondary" style={{ float: "right" }}>
              15 minutes ago
            </Text>
          </div>
        </div>
      ),
    },
    {
      color: "purple",
      children: (
        <div>
          <Text strong>Customer account created</Text>
          <div>
            <Text type="secondary">by Mike Davis</Text>
            <Text type="secondary" style={{ float: "right" }}>
              1 hour ago
            </Text>
          </div>
        </div>
      ),
    },
    {
      color: "orange",
      children: (
        <div>
          <Text strong>Payment received</Text>
          <div>
            <Text type="secondary">by Emma Wilson</Text>
            <Text type="secondary" style={{ float: "right" }}>
              2 hours ago
            </Text>
          </div>
        </div>
      ),
    },
  ];

  const quickActions = [
    {
      title: "New Booking",
      icon: <TruckOutlined style={{ fontSize: "24px", color: "#1677ff" }} />,
      color: "#1677ff",
    },
    {
      title: "Track Shipment",
      icon: <SearchOutlined style={{ fontSize: "24px", color: "#52c41a" }} />,
      color: "#52c41a",
    },
    {
      title: "Add Customer",
      icon: <UserAddOutlined style={{ fontSize: "24px", color: "#722ed1" }} />,
      color: "#722ed1",
    },
    {
      title: "Generate Invoice",
      icon: <FileTextOutlined style={{ fontSize: "24px", color: "#fa8c16" }} />,
      color: "#fa8c16",
    },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Welcome back, {user?.firstName || "User"}!
            </Title>
            <Paragraph style={{ margin: "8px 0" }}>
              Here's what's happening with your NVOCC operations today.
            </Paragraph>
            <Tag color="blue">Role: {activeRole?.replace("_", " ")}</Tag>
          </Col>
          <Col>
            <Avatar
              size={64}
              icon={<TruckOutlined />}
              style={{ backgroundColor: "#1677ff" }}
            />
          </Col>
        </Row>
      </Card>

      {/* Stats Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                precision={stat.precision}
                valueStyle={stat.valueStyle}
                prefix={stat.prefix}
                suffix={stat.suffix}
                formatter={stat.formatter}
              />
              <Text
                type={stat.change > 0 ? "success" : "danger"}
                style={{ fontSize: "14px" }}
              >
                {stat.change > 0 ? "+" : ""}
                {stat.change}%
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts and Recent Activity */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Chart Placeholder */}
        <Col xs={24} lg={12}>
          <Card title="Booking Trends" extra={<BarChartOutlined />}>
            <div
              style={{
                height: 300,
                background: "#fafafa",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <BarChartOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <Text type="secondary">Chart will be displayed here</Text>
            </div>
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24} lg={12}>
          <Card title="Recent Activities">
            <Timeline items={recentActivities} />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                hoverable
                style={{ textAlign: "center" }}
                bodyStyle={{ padding: "24px" }}
              >
                <Space direction="vertical" size="middle">
                  {action.icon}
                  <Text strong>{action.title}</Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
