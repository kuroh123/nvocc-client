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
  ShopOutlined,
  GlobalOutlined,
  FilterOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import FormModal from "../components/common/FormModal";
import AgentForm from "../components/forms/AgentForm";
import agentService from "../services/agentService";
import portService from "../services/portService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Agents = () => {
  const { hasPermission, hasRole, activeRole } = useAuth();

  // Check if user can perform agent operations based on roles
  const canCreateAgent =
    hasPermission("agents:create") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canEditAgent =
    hasPermission("agents:update") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canDeleteAgent =
    hasPermission("agents:delete") ||
    ["ADMIN", "MASTER_PORT"].includes(activeRole);

  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [ports, setPorts] = useState([]);
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
    status: undefined,
    portId: undefined,
    ownOffice: undefined,
  });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    ownOffice: 0,
  });

  useEffect(() => {
    fetchAgents();
    fetchPorts();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === undefined ||
          params[key] === null
        ) {
          delete params[key];
        }
      });

      console.log("Fetching agents with params:", params);

      const response = await agentService.getAllAgents(params);

      if (response.success) {
        setAgents(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));

        // Update stats
        updateStats(response.data || []);
      } else {
        message.error("Failed to fetch agents");
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      message.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  const fetchPorts = async () => {
    try {
      const response = await portService.getAllPorts({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setPorts(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching ports:", error);
    }
  };

  const updateStats = (agentsData) => {
    const total = agentsData.length;
    const active = agentsData.filter(
      (agent) => agent.status === "ACTIVE"
    ).length;
    const inactive = agentsData.filter(
      (agent) => agent.status === "INACTIVE"
    ).length;
    const ownOffice = agentsData.filter(
      (agent) => agent.ownOffice === true
    ).length;

    setStats({ total, active, inactive, ownOffice });
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
      status: undefined,
      portId: undefined,
      ownOffice: undefined,
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedAgent(null);
    setIsModalVisible(true);
  };

  const openEditModal = (agent) => {
    setModalMode("edit");
    setSelectedAgent(agent);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedAgent(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      setFormLoading(true);
      let response;

      if (modalMode === "create") {
        response = await agentService.createAgent(values);
        message.success("Agent created successfully");
      } else {
        response = await agentService.updateAgent(selectedAgent.id, values);
        message.success("Agent updated successfully");
      }

      if (response.success) {
        closeModal();
        fetchAgents();
      }
    } catch (error) {
      console.error(
        `Error ${modalMode === "create" ? "creating" : "updating"} agent:`,
        error
      );
      message.error(error.message || `Failed to ${modalMode} agent`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await agentService.deleteAgent(id);
      if (response.success) {
        message.success("Agent deleted successfully");
        fetchAgents();
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      message.error(error.message || "Failed to delete agent");
    }
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
          <Text type="secondary" className="text-xs">
            {record.companyName}
          </Text>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => text || "-",
    },
    {
      title: "Port",
      dataIndex: ["port", "name"],
      key: "port",
      render: (text, record) => (
        <div>
          <div>{record.port?.name || "-"}</div>
          {record.port?.portCode && (
            <Text type="secondary" className="text-xs">
              {record.port.portCode}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <div>
          {record.mobNum && <div className="text-xs">M: {record.mobNum}</div>}
          {record.telNum && <div className="text-xs">T: {record.telNum}</div>}
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) => (
        <div>
          {record.city && <div className="text-sm">{record.city}</div>}
          {record.country?.name && (
            <Text type="secondary" className="text-xs">
              {record.country.name}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Own Office",
      dataIndex: "ownOffice",
      key: "ownOffice",
      render: (ownOffice) => (
        <Tag color={ownOffice ? "blue" : "default"}>
          {ownOffice ? <CheckCircleOutlined /> : null}
          {ownOffice ? "Yes" : "No"}
        </Tag>
      ),
      filters: [
        { text: "Yes", value: true },
        { text: "No", value: false },
      ],
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
          {canEditAgent && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canDeleteAgent && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this agent?"
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
                icon={<ShopOutlined />}
                style={{ backgroundColor: "#52c41a" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Agent Management
                </Title>
                <Text type="secondary">
                  Manage and monitor agents across different ports and regions
                </Text>
              </div>
            </Space>
          </Col>
          {canCreateAgent && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add Agent
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
              title="Total Agents"
              value={pagination.total}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Agents"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Inactive Agents"
              value={stats.inactive}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Own Office"
              value={stats.ownOffice}
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
              placeholder="Search agents..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
            />
          </Col>
          <Col xs={24} sm={8} md={4} lg={4} xl={4}>
            <Select
              placeholder="All Ports"
              allowClear
              value={filters.portId}
              onChange={(value) => handleFilterChange("portId", value)}
              className="w-full"
            >
              {ports.map((port) => (
                <Option key={port.id} value={port.id}>
                  {port.name}
                </Option>
              ))}
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
            <Select
              placeholder="Own Office"
              allowClear
              value={filters.ownOffice}
              onChange={(value) => handleFilterChange("ownOffice", value)}
              className="w-full"
            >
              <Option value="true">Yes</Option>
              <Option value="false">No</Option>
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
              onClick={fetchAgents}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Agents Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={agents}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Agent Form Modal */}
      <FormModal
        visible={isModalVisible}
        onCancel={closeModal}
        title={modalMode === "create" ? "Create New Agent" : "Edit Agent"}
        width={900}
      >
        <AgentForm
          initialValues={selectedAgent}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isLoading={formLoading}
        />
      </FormModal>
    </div>
  );
};

export default Agents;
