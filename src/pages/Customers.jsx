import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  Table,
  Button,
  Input,
  Tag,
  Space,
  Avatar,
  Typography,
  Row,
  Col,
  Empty,
  Tooltip,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;

const Customers = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock customers data
  const customers = [
    {
      key: "1",
      id: "CUST001",
      name: "ABC Trading Co.",
      email: "contact@abctrading.com",
      phone: "+1-555-0123",
      address: "123 Business St, New York, NY 10001",
      country: "United States",
      status: "active",
      totalBookings: 15,
      lastBooking: "2025-08-28",
      creditLimit: 50000,
    },
    {
      key: "2",
      id: "CUST002",
      name: "Global Imports Ltd.",
      email: "info@globalimports.com",
      phone: "+44-20-7123-4567",
      address: "456 Import Ave, London, EC1A 1BB",
      country: "United Kingdom",
      status: "active",
      totalBookings: 32,
      lastBooking: "2025-08-30",
      creditLimit: 75000,
    },
    {
      key: "3",
      id: "CUST003",
      name: "Pacific Traders",
      email: "sales@pacifictraders.com",
      phone: "+86-21-1234-5678",
      address: "789 Export Rd, Shanghai, 200001",
      country: "China",
      status: "inactive",
      totalBookings: 8,
      lastBooking: "2025-07-15",
      creditLimit: 25000,
    },
    {
      key: "4",
      id: "CUST004",
      name: "Euro Logistics",
      email: "orders@eurologistics.de",
      phone: "+49-40-123-4567",
      address: "321 Logistics Blvd, Hamburg, 20095",
      country: "Germany",
      status: "active",
      totalBookings: 28,
      lastBooking: "2025-08-29",
      creditLimit: 60000,
    },
  ];

  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: "green", text: "Active" },
      inactive: { color: "default", text: "Inactive" },
      suspended: { color: "red", text: "Suspended" },
    };

    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: "#87d068" }}
          />
          <div>
            <div>
              <Text strong>{record.name}</Text>
            </div>
            <div>
              <Text type="secondary">{record.id}</Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact Info",
      key: "contact",
      render: (_, record) => (
        <div>
          <div>{record.email}</div>
          <div>
            <Text type="secondary">{record.phone}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) => (
        <div>
          <div>{record.country}</div>
          <div>
            <Text type="secondary" ellipsis={{ tooltip: record.address }}>
              {record.address}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Bookings",
      key: "bookings",
      render: (_, record) => (
        <div>
          <div>
            <Text strong>{record.totalBookings}</Text> total
          </div>
          <div>
            <Text type="secondary">Last: {record.lastBooking}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Credit Limit",
      dataIndex: "creditLimit",
      key: "creditLimit",
      render: (value) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          {hasPermission("customers:edit") && (
            <Tooltip title="Edit">
              <Button type="text" icon={<EditOutlined />} size="small" />
            </Tooltip>
          )}
          {hasPermission("customers:delete") && (
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div>
      {/* Page Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: "#722ed1" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Customers
                </Title>
                <Text type="secondary">Manage your customer database</Text>
              </div>
            </Space>
          </Col>
          {hasPermission("customers:create") && (
            <Col>
              <Button type="primary" icon={<PlusOutlined />}>
                Add Customer
              </Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* Customer Stats */}
      {/* <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Customers"
              value={customers.length}
              prefix={<UserOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Customers"
              value={customers.filter((c) => c.status === "active").length}
              prefix={<UserOutlined style={{ color: "#1677ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Credit Limit"
              value={customers.reduce((sum, c) => sum + c.creditLimit, 0)}
              formatter={(value) => formatCurrency(value)}
              prefix={<UserOutlined style={{ color: "#722ed1" }} />}
            />
          </Card>
        </Col>
      </Row> */}

      {/* Search */}
      <Card style={{ marginBottom: 24 }}>
        <Search
          placeholder="Search customers..."
          allowClear
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </Card>

      {/* Customers Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={
                  <UserOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                }
                description={
                  <div>
                    <Text strong>No customers found</Text>
                    <br />
                    <Text type="secondary">
                      {searchTerm
                        ? "Try adjusting your search criteria."
                        : "Get started by adding your first customer."}
                    </Text>
                  </div>
                }
              >
                {hasPermission("customers:create") && !searchTerm && (
                  <Button type="primary" icon={<PlusOutlined />}>
                    Add Customer
                  </Button>
                )}
              </Empty>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default Customers;
