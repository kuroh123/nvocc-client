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
  DatabaseOutlined,
  GlobalOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FormModal from "../components/common/FormModal";
import PortForm from "../components/forms/PortForm";
import portService from "../services/portService";
import countryService from "../services/countryService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Ports = () => {
  const { hasPermission, hasRole, activeRole } = useAuth();

  // Check if user can perform port operations based on roles
  const canCreatePort =
    hasPermission("ports:create") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canEditPort =
    hasPermission("ports:update") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canDeletePort =
    hasPermission("ports:delete") ||
    ["ADMIN", "MASTER_PORT"].includes(activeRole);

  const [loading, setLoading] = useState(false);
  const [ports, setPorts] = useState([]);
  const [countries, setCountries] = useState([]);
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
    portType: "",
    countryId: "",
  });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [selectedPort, setSelectedPort] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    seaPorts: 0,
  });

  useEffect(() => {
    fetchPorts();
    fetchCountries();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchPorts = async () => {
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

      const response = await portService.getAllPorts(params);

      if (response.success) {
        setPorts(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));

        // Update stats
        updateStats(response.data || []);
      } else {
        message.error("Failed to fetch ports");
      }
    } catch (error) {
      console.error("Error fetching ports:", error);
      message.error("Failed to fetch ports");
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await countryService.getAllCountries({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setCountries(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const updateStats = (portsData) => {
    const total = portsData.length;
    const active = portsData.filter((port) => port.status === "ACTIVE").length;
    const inactive = portsData.filter(
      (port) => port.status === "INACTIVE"
    ).length;
    const seaPorts = portsData.filter(
      (port) => port.portType === "SEA_PORT"
    ).length;

    setStats({ total, active, inactive, seaPorts });
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
      portType: "",
      countryId: "",
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedPort(null);
    setIsModalVisible(true);
  };

  const openEditModal = (port) => {
    setModalMode("edit");
    setSelectedPort(port);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedPort(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      setFormLoading(true);
      let response;

      if (modalMode === "create") {
        response = await portService.createPort(values);
        message.success("Port created successfully");
      } else {
        response = await portService.updatePort(selectedPort.id, values);
        message.success("Port updated successfully");
      }

      if (response.success) {
        closeModal();
        fetchPorts();
      }
    } catch (error) {
      console.error(
        `Error ${modalMode === "create" ? "creating" : "updating"} port:`,
        error
      );
      message.error(error.message || `Failed to ${modalMode} port`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await portService.deletePort(id);
      if (response.success) {
        message.success("Port deleted successfully");
        fetchPorts();
      }
    } catch (error) {
      console.error("Error deleting port:", error);
      message.error(error.message || "Failed to delete port");
    }
  };

  const getPortTypeTag = (portType) => {
    const types = {
      SEA_PORT: { color: "blue", label: "Sea Port" },
      AIR_PORT: { color: "cyan", label: "Air Port" },
      LAND_PORT: { color: "green", label: "Land Port" },
      RAIL_PORT: { color: "purple", label: "Rail Port" },
    };

    return (
      <Tag color={types[portType]?.color || "default"}>
        {types[portType]?.label || portType}
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
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.portCode && (
            <Text type="secondary" className="text-xs">
              Code: {record.portCode}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "portType",
      key: "portType",
      render: getPortTypeTag,
      filters: [
        { text: "Sea Port", value: "SEA_PORT" },
        { text: "Air Port", value: "AIR_PORT" },
        { text: "Land Port", value: "LAND_PORT" },
        { text: "Rail Port", value: "RAIL_PORT" },
      ],
    },
    {
      title: "Country",
      dataIndex: ["country", "name"],
      key: "country",
      render: (text, record) => (
        <div>
          <div>{record.country?.name}</div>
          <Text type="secondary" className="text-xs">
            {record.country?.codeChar2}
          </Text>
        </div>
      ),
    },
    {
      title: "ITA Code",
      dataIndex: "itaCode",
      key: "itaCode",
      render: (text) => text || "-",
    },
    {
      title: "Terminals",
      dataIndex: "Terminal",
      key: "terminals",
      render: (terminals) => (
        <div>
          <span>{terminals?.length || 0}</span>
          {terminals?.length > 0 && (
            <Tooltip
              title={terminals.map((t) => `${t.name} (${t.status})`).join(", ")}
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="link" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          {canEditPort && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canDeletePort && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this port?"
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
                icon={<DatabaseOutlined />}
                style={{ backgroundColor: "#722ed1" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Port Management
                </Title>
                <Text type="secondary">
                  Manage and monitor ports across different countries and
                  regions
                </Text>
              </div>
            </Space>
          </Col>
          {hasPermission("ports:create") && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add Port
              </Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* Statistics Cards */}
      {/* <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Ports"
              value={pagination.total}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Ports"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Inactive Ports"
              value={stats.inactive}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sea Ports"
              value={stats.seaPorts}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row> */}

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={8} lg={6} xl={6}>
            <Search
              placeholder="Search ports..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
            />
          </Col>
          <Col xs={24} sm={8} md={4} lg={4} xl={4}>
            <Select
              placeholder="All Countries"
              allowClear
              value={filters.countryId}
              onChange={(value) => handleFilterChange("countryId", value)}
              className="w-full"
            >
              {countries.map((country) => (
                <Option key={country.id} value={country.id}>
                  {country.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4} lg={4} xl={4}>
            <Select
              placeholder="All Types"
              allowClear
              value={filters.portType}
              onChange={(value) => handleFilterChange("portType", value)}
              className="w-full"
            >
              <Option value="SEA_PORT">Sea Port</Option>
              <Option value="DRY_PORT">Dry Port</Option>
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
          <Col xs={24} sm={8} md={4} lg={3} xl={3}>
            <Button
              className="w-full"
              icon={<FilterOutlined />}
              onClick={clearFilters}
            >
              Clear
            </Button>
          </Col>
          <Col xs={24} sm={8} md={4} lg={3} xl={3}>
            <Button
              className="w-full"
              icon={<ReloadOutlined />}
              onClick={fetchPorts}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Ports Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={ports}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Port Form Modal */}
      <FormModal
        visible={isModalVisible}
        onCancel={closeModal}
        title={modalMode === "create" ? "Create New Port" : "Edit Port"}
        width={800}
      >
        <PortForm
          initialValues={selectedPort}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isLoading={formLoading}
        />
      </FormModal>
    </div>
  );
};

export default Ports;
