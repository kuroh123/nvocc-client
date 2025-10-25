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
  ToolOutlined,
  GlobalOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FormModal from "../components/common/FormModal";
import OperatorForm from "../components/forms/OperatorForm";
import operatorService from "../services/operatorService";
import portService from "../services/portService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Operators = () => {
  const { hasPermission, hasRole, activeRole } = useAuth();

  // Check if user can perform operator operations based on roles
  const canCreateOperator =
    hasPermission("operators:create") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canEditOperator =
    hasPermission("operators:update") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canDeleteOperator =
    hasPermission("operators:delete") ||
    ["ADMIN", "MASTER_PORT"].includes(activeRole);

  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState([]);
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
    status: "",
    portId: "",
  });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchOperators();
    fetchPorts();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchOperators = async () => {
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

      const response = await operatorService.getAllOperators(params);

      if (response.success) {
        setOperators(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));

        // Update stats
        updateStats(response.data || []);
      } else {
        message.error("Failed to fetch operators");
      }
    } catch (error) {
      console.error("Error fetching operators:", error);
      message.error("Failed to fetch operators");
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

  const updateStats = (operatorsData) => {
    const total = operatorsData.length;
    const active = operatorsData.filter(
      (operator) => operator.status === "ACTIVE"
    ).length;
    const inactive = operatorsData.filter(
      (operator) => operator.status === "INACTIVE"
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
      search: "",
      status: "",
      portId: "",
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedOperator(null);
    setIsModalVisible(true);
  };

  const openEditModal = (operator) => {
    setModalMode("edit");
    setSelectedOperator(operator);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedOperator(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      setFormLoading(true);
      let response;

      if (modalMode === "create") {
        response = await operatorService.createOperator(values);
        message.success("Operator created successfully");
      } else {
        response = await operatorService.updateOperator(
          selectedOperator.id,
          values
        );
        message.success("Operator updated successfully");
      }

      if (response.success) {
        closeModal();
        fetchOperators();
      }
    } catch (error) {
      console.error(
        `Error ${modalMode === "create" ? "creating" : "updating"} operator:`,
        error
      );
      message.error(error.message || `Failed to ${modalMode} operator`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await operatorService.deleteOperator(id);
      if (response.success) {
        message.success("Operator deleted successfully");
        fetchOperators();
      }
    } catch (error) {
      console.error("Error deleting operator:", error);
      message.error(error.message || "Failed to delete operator");
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
          {canEditOperator && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canDeleteOperator && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this operator?"
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
                icon={<ToolOutlined />}
                style={{ backgroundColor: "#722ed1" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Operator Management
                </Title>
                <Text type="secondary">
                  Manage and monitor operators across different ports and
                  regions
                </Text>
              </div>
            </Space>
          </Col>
          {canCreateOperator && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add Operator
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
              title="Total Operators"
              value={pagination.total}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Operators"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Inactive Operators"
              value={stats.inactive}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={8} lg={6} xl={6}>
            <Search
              placeholder="Search operators..."
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
              onClick={fetchOperators}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Operators Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={operators}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Operator Form Modal */}
      <FormModal
        visible={isModalVisible}
        onCancel={closeModal}
        title={modalMode === "create" ? "Create New Operator" : "Edit Operator"}
        width={900}
      >
        <OperatorForm
          initialValues={selectedOperator}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isLoading={formLoading}
        />
      </FormModal>
    </div>
  );
};

export default Operators;
