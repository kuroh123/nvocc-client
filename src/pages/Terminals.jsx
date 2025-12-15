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
  ApartmentOutlined,
  GlobalOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FormModal from "../components/common/FormModal";
import TerminalForm from "../components/forms/TerminalForm";
import terminalService from "../services/terminalService";
import portService from "../services/portService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Terminals = () => {
  const { hasPermission, hasRole, activeRole } = useAuth();

  // Check if user can perform terminal operations based on roles
  const canCreateTerminal =
    hasPermission("terminals:create") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canEditTerminal =
    hasPermission("terminals:update") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canDeleteTerminal =
    hasPermission("terminals:delete") ||
    ["ADMIN", "MASTER_PORT"].includes(activeRole);

  const [loading, setLoading] = useState(false);
  const [terminals, setTerminals] = useState([]);
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
    status: undefined,
    search: undefined,
    portId: undefined,
  });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [selectedTerminal, setSelectedTerminal] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchTerminals();
    fetchPorts();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchTerminals = async () => {
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

      const response = await terminalService.getAllTerminals(params);

      if (response.success) {
        setTerminals(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));

        // Update stats
        updateStats(response.data || []);
      } else {
        message.error("Failed to fetch terminals");
      }
    } catch (error) {
      console.error("Error fetching terminals:", error);
      message.error("Failed to fetch terminals");
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

  const updateStats = (terminalsData) => {
    const total = terminalsData.length;
    const active = terminalsData.filter(
      (terminal) => terminal.status === "ACTIVE"
    ).length;
    const inactive = terminalsData.filter(
      (terminal) => terminal.status === "INACTIVE"
    ).length;

    setStats({ total, active, inactive });
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
      search: undefined,
      status: undefined,
      portId: undefined,
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedTerminal(null);
    setIsModalVisible(true);
  };

  const openEditModal = (terminal) => {
    setModalMode("edit");
    setSelectedTerminal(terminal);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedTerminal(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      setFormLoading(true);
      let response;

      if (modalMode === "create") {
        response = await terminalService.createTerminal(values);
        message.success("Terminal created successfully");
      } else {
        response = await terminalService.updateTerminal(
          selectedTerminal.id,
          values
        );
        message.success("Terminal updated successfully");
      }

      if (response.success) {
        closeModal();
        fetchTerminals();
      }
    } catch (error) {
      console.error(
        `Error ${modalMode === "create" ? "creating" : "updating"} terminal:`,
        error
      );
      message.error(error.message || `Failed to ${modalMode} terminal`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await terminalService.deleteTerminal(id);
      if (response.success) {
        message.success("Terminal deleted successfully");
        fetchTerminals();
      }
    } catch (error) {
      console.error("Error deleting terminal:", error);
      message.error(error.message || "Failed to delete terminal");
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
          {record.description && (
            <Text type="secondary" className="text-xs">
              {record.description.substring(0, 50)}
              {record.description.length > 50 ? "..." : ""}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Port",
      dataIndex: ["port", "name"],
      key: "port",
      render: (text, record) => (
        <div>
          <div>{record.port?.name}</div>
          <Text type="secondary" className="text-xs">
            {record.port?.portCode}
          </Text>
        </div>
      ),
    },
    {
      title: "Country",
      dataIndex: ["port", "country", "name"],
      key: "country",
      render: (text, record) => (
        <div>
          <div>{record.port?.country?.name}</div>
          <Text type="secondary" className="text-xs">
            {record.port?.country?.codeChar2}
          </Text>
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
      render: (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString();
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="link" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          {canEditTerminal && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canDeleteTerminal && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this terminal?"
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
                icon={<ApartmentOutlined />}
                style={{ backgroundColor: "#1890ff" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Terminal Management
                </Title>
                <Text type="secondary">
                  Manage and monitor terminals across different ports
                </Text>
              </div>
            </Space>
          </Col>
          {canCreateTerminal && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add Terminal
              </Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Terminals"
              value={pagination.total}
              prefix={<ApartmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Terminals"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Inactive Terminals"
              value={stats.inactive}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Search
              placeholder="Search terminals..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
            />
          </Col>
          <Col xs={24} sm={8} md={6} lg={6} xl={6}>
            <Select
              placeholder="All Ports"
              allowClear
              value={filters.portId}
              onChange={(value) => handleFilterChange("portId", value)}
              className="w-full"
              showSearch
              filterOption={(input, option) => {
                const port = ports.find((p) => p.id === option.value);
                if (!port) return false;
                const searchableText =
                  `${port.name} ${port.portCode}`.toLowerCase();
                return searchableText.indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {ports.map((port) => (
                <Option key={port.id} value={port.id}>
                  {port.name} ({port.portCode})
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
          <Col xs={24} sm={8} md={3} lg={3} xl={3}>
            <Button
              className="w-full"
              icon={<FilterOutlined />}
              onClick={clearFilters}
            >
              Clear
            </Button>
          </Col>
          <Col xs={24} sm={8} md={3} lg={3} xl={3}>
            <Button
              className="w-full"
              icon={<ReloadOutlined />}
              onClick={fetchTerminals}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Terminals Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={terminals}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Terminal Form Modal */}
      <FormModal
        visible={isModalVisible}
        onCancel={closeModal}
        title={modalMode === "create" ? "Create New Terminal" : "Edit Terminal"}
        width={800}
      >
        <TerminalForm
          initialValues={selectedTerminal}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isLoading={formLoading}
        />
      </FormModal>
    </div>
  );
};

export default Terminals;
