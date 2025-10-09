import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Avatar,
  Typography,
  Row,
  Col,
  Empty,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  TruckOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Bookings = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock bookings data
  const bookings = [
    {
      key: "1",
      id: "BKG001",
      customer: "ABC Trading Co.",
      origin: "Shanghai",
      destination: "Los Angeles",
      status: "confirmed",
      vessel: "MSC Diana",
      etd: "2025-09-15",
      eta: "2025-10-02",
      containers: 2,
      type: "FCL",
    },
    {
      key: "2",
      id: "BKG002",
      customer: "Global Imports Ltd.",
      origin: "Rotterdam",
      destination: "New York",
      status: "in-transit",
      vessel: "Ever Given",
      etd: "2025-09-10",
      eta: "2025-09-28",
      containers: 5,
      type: "FCL",
    },
    {
      key: "3",
      id: "BKG003",
      customer: "Pacific Traders",
      origin: "Hong Kong",
      destination: "Long Beach",
      status: "pending",
      vessel: "COSCO Glory",
      etd: "2025-09-20",
      eta: "2025-10-08",
      containers: 1,
      type: "LCL",
    },
    {
      key: "4",
      id: "BKG004",
      customer: "Euro Logistics",
      origin: "Hamburg",
      destination: "Miami",
      status: "delivered",
      vessel: "Maersk Estonia",
      etd: "2025-08-25",
      eta: "2025-09-15",
      containers: 3,
      type: "FCL",
    },
  ];

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: "orange", text: "Pending" },
      confirmed: { color: "blue", text: "Confirmed" },
      "in-transit": { color: "purple", text: "In Transit" },
      delivered: { color: "green", text: "Delivered" },
      cancelled: { color: "red", text: "Cancelled" },
    };

    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Route",
      key: "route",
      render: (_, record) => (
        <div>
          <div>{record.origin}</div>
          <ArrowDownOutlined style={{ color: "#999", fontSize: "12px" }} />
          <div>{record.destination}</div>
        </div>
      ),
    },
    {
      title: "Vessel",
      dataIndex: "vessel",
      key: "vessel",
    },
    {
      title: "ETD/ETA",
      key: "dates",
      render: (_, record) => (
        <div>
          <div>
            <Text type="secondary">ETD:</Text> {record.etd}
          </div>
          <div>
            <Text type="secondary">ETA:</Text> {record.eta}
          </div>
        </div>
      ),
    },
    {
      title: "Containers",
      key: "containers",
      render: (_, record) => (
        <div>
          <Text strong>{record.containers}</Text>
          <Text type="secondary"> ({record.type})</Text>
        </div>
      ),
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
          {hasPermission("bookings:edit") && (
            <Tooltip title="Edit">
              <Button type="text" icon={<EditOutlined />} size="small" />
            </Tooltip>
          )}
          {hasPermission("bookings:delete") && (
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

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || booking.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Page Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <Avatar
                icon={<TruckOutlined />}
                style={{ backgroundColor: "#1677ff" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Bookings
                </Title>
                <Text type="secondary">
                  Manage and track your shipping bookings
                </Text>
              </div>
            </Space>
          </Col>
          {hasPermission("bookings:create") && (
            <Col>
              <Button type="primary" icon={<PlusOutlined />}>
                New Booking
              </Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* Filters and Search */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="Search bookings..."
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: 400 }}
            />
          </Col>
          <Col>
            <Space>
              <FilterOutlined style={{ color: "#999" }} />
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 150 }}
              >
                <Option value="all">All Status</Option>
                <Option value="pending">Pending</Option>
                <Option value="confirmed">Confirmed</Option>
                <Option value="in-transit">In Transit</Option>
                <Option value="delivered">Delivered</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Bookings Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredBookings}
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
                  <TruckOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                }
                description={
                  <div>
                    <Text strong>No bookings found</Text>
                    <br />
                    <Text type="secondary">
                      {searchTerm || filterStatus !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "Get started by creating a new booking."}
                    </Text>
                  </div>
                }
              >
                {hasPermission("bookings:create") &&
                  !searchTerm &&
                  filterStatus === "all" && (
                    <Button type="primary" icon={<PlusOutlined />}>
                      New Booking
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

export default Bookings;
