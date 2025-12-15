import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  Table,
  Button,
  Input,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Tooltip,
  Popconfirm,
  message,
  Select,
  Avatar,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  RocketOutlined,
  GlobalOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FormModal from "../components/common/FormModal";
import VesselForm from "../components/forms/VesselForm";
import vesselService from "../services/vesselService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Vessels = () => {
  const { hasPermission, hasRole, activeRole } = useAuth();

  // Check if user can perform vessel operations based on roles
  const canCreateVessel =
    hasPermission("vessels:create") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canEditVessel =
    hasPermission("vessels:update") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canDeleteVessel =
    hasPermission("vessels:delete") ||
    ["ADMIN", "MASTER_PORT"].includes(activeRole);

  const [loading, setLoading] = useState(false);
  const [vessels, setVessels] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "",
  });

  console.log("$$$$", vessels);
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    containerShips: 0,
  });

  useEffect(() => {
    fetchVessels();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchVessels = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === "") {
          delete params[key];
        }
      });

      const response = await vesselService.getAllVessels(params);
      console.log(response);
      if (response.success) {
        console.log("***", response.data);
        setVessels(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));

        // Update stats
        updateStats(response.data || []);
      } else {
        message.error("Failed to fetch vessels");
      }
    } catch (error) {
      console.error("Error fetching vessels:", error);
      message.error("Failed to fetch vessels");
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (vesselsData) => {
    const total = vesselsData.length;
    const active = vesselsData.filter(
      (vessel) => vessel.status === "ACTIVE"
    ).length;
    const inactive = vesselsData.filter(
      (vessel) => vessel.status === "INACTIVE"
    ).length;
    const containerShips = vesselsData.filter(
      (vessel) => vessel.type === "CONTAINER_SHIP"
    ).length;

    setStats({ total, active, inactive, containerShips });
  };

  const handleTableChange = (paginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }));
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      type: "",
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedVessel(null);
    setIsModalVisible(true);
  };

  const openEditModal = (vessel) => {
    setModalMode("edit");
    setSelectedVessel(vessel);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedVessel(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      setFormLoading(true);
      let response;

      if (modalMode === "create") {
        response = await vesselService.createVessel(values);
        message.success("Vessel created successfully");
      } else {
        response = await vesselService.updateVessel(selectedVessel.id, values);
        message.success("Vessel updated successfully");
      }

      if (response.success) {
        closeModal();
        fetchVessels();
      }
    } catch (error) {
      console.error(
        `Error ${modalMode === "create" ? "creating" : "updating"} vessel:`,
        error
      );
      message.error(error.message || `Failed to ${modalMode} vessel`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await vesselService.deleteVessel(id);
      if (response.success) {
        message.success("Vessel deleted successfully");
        fetchVessels();
      }
    } catch (error) {
      console.error("Error deleting vessel:", error);
      message.error(error.message || "Failed to delete vessel");
    }
  };

  const getVesselTypeTag = (type) => {
    const types = {
      CONTAINER_SHIP: { color: "blue", label: "Container Ship" },
      BULK_CARRIER: { color: "orange", label: "Bulk Carrier" },
      TANKER: { color: "red", label: "Tanker" },
      RO_RO: { color: "purple", label: "RO-RO" },
      GENERAL_CARGO: { color: "green", label: "General Cargo" },
      PASSENGER: { color: "cyan", label: "Passenger" },
      OTHER: { color: "default", label: "Other" },
    };

    return (
      <Tag color={types[type]?.color || "default"}>
        {types[type]?.label || type}
      </Tag>
    );
  };

  const getStatusTag = (status) => {
    return <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>;
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (text) => <div className="font-medium">{text}</div>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: getVesselTypeTag,
      filters: [
        { text: "Container Ship", value: "CONTAINER_SHIP" },
        { text: "Bulk Carrier", value: "BULK_CARRIER" },
        { text: "Tanker", value: "TANKER" },
        { text: "RO-RO", value: "RO_RO" },
        { text: "General Cargo", value: "GENERAL_CARGO" },
        { text: "Passenger", value: "PASSENGER" },
        { text: "Other", value: "OTHER" },
      ],
    },
    {
      title: "Schedules",
      dataIndex: "schedules",
      key: "schedules",
      render: (schedules) => (
        <div>
          <span>{schedules?.length || 0}</span>
          {schedules?.length > 0 && (
            <Tooltip
              title={schedules
                .map((s) => `${s.voyage} - ${s.serviceName || "N/A"}`)
                .join(", ")}
            >
              <Button type="link" size="small">
                View
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
      filters: [
        { text: "Active", value: "ACTIVE" },
        { text: "Inactive", value: "INACTIVE" },
      ],
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="link" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          {canEditVessel && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canDeleteVessel && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this vessel?"
                description="This action cannot be undone."
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="link"
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <Avatar
                icon={<RocketOutlined />}
                style={{ backgroundColor: "#1890ff" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Vessel Management
                </Title>
                <Text type="secondary">
                  Manage and monitor vessels used in shipping operations
                </Text>
              </div>
            </Space>
          </Col>
          {canCreateVessel && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add Vessel
              </Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Vessels"
              value={pagination.total}
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Vessels"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Inactive Vessels"
              value={stats.inactive}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Container Ships"
              value={stats.containerShips}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={8} lg={6} xl={6}>
            <Search
              placeholder="Search vessels..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
            />
          </Col>
          <Col xs={24} sm={8} md={4} lg={4} xl={4}>
            <Select
              placeholder="All Types"
              allowClear
              value={filters.type}
              onChange={(value) => handleFilterChange("type", value)}
              className="w-full"
            >
              <Option value="CONTAINER_SHIP">Container Ship</Option>
              <Option value="BULK_CARRIER">Bulk Carrier</Option>
              <Option value="TANKER">Tanker</Option>
              <Option value="RO_RO">RO-RO</Option>
              <Option value="GENERAL_CARGO">General Cargo</Option>
              <Option value="PASSENGER">Passenger</Option>
              <Option value="OTHER">Other</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4} lg={4} xl={4}>
            <Select
              placeholder="All Status"
              allowClear
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              className="w-full"
            >
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4} lg={4} xl={4}>
            <Button
              className="w-full"
              icon={<FilterOutlined />}
              onClick={clearFilters}
            >
              Clear
            </Button>
          </Col>
          <Col xs={24} sm={8} md={4} lg={4} xl={4}>
            <Button
              className="w-full"
              icon={<ReloadOutlined />}
              onClick={fetchVessels}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Vessels Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={vessels}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Vessel Form Modal */}
      <FormModal
        visible={isModalVisible}
        onCancel={closeModal}
        title={modalMode === "create" ? "Create New Vessel" : "Edit Vessel"}
        width={600}
      >
        <VesselForm
          initialValues={selectedVessel}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isLoading={formLoading}
        />
      </FormModal>
    </div>
  );
};

export default Vessels;
