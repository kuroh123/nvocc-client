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
  HomeOutlined,
  GlobalOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FormModal from "../components/common/FormModal";
import DepotForm from "../components/forms/DepotForm";
import depotService from "../services/depotService";
import portService from "../services/portService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Depots = () => {
  const { hasPermission, hasRole, activeRole } = useAuth();

  // Check if user can perform depot operations based on roles
  const canCreateDepot =
    hasPermission("depots:create") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canEditDepot =
    hasPermission("depots:update") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canDeleteDepot =
    hasPermission("depots:delete") ||
    ["ADMIN", "MASTER_PORT"].includes(activeRole);

  const [loading, setLoading] = useState(false);
  const [depots, setDepots] = useState([]);
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
  const [selectedDepot, setSelectedDepot] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchDepots();
    fetchPorts();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchDepots = async () => {
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

      const response = await depotService.getAllDepots(params);

      if (response.success) {
        setDepots(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));

        // Update stats
        updateStats(response.data || []);
      } else {
        message.error("Failed to fetch depots");
      }
    } catch (error) {
      console.error("Error fetching depots:", error);
      message.error("Failed to fetch depots");
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

  const updateStats = (depotsData) => {
    const total = depotsData.length;
    const active = depotsData.filter(
      (depot) => depot.status === "ACTIVE"
    ).length;
    const inactive = depotsData.filter(
      (depot) => depot.status === "INACTIVE"
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
    setSelectedDepot(null);
    setIsModalVisible(true);
  };

  const openEditModal = (depot) => {
    setModalMode("edit");
    setSelectedDepot(depot);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedDepot(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      setFormLoading(true);
      let response;

      if (modalMode === "create") {
        response = await depotService.createDepot(values);
        message.success("Depot created successfully");
      } else {
        response = await depotService.updateDepot(selectedDepot.id, values);
        message.success("Depot updated successfully");
      }

      if (response.success) {
        closeModal();
        fetchDepots();
      }
    } catch (error) {
      console.error(
        `Error ${modalMode === "create" ? "creating" : "updating"} depot:`,
        error
      );
      message.error(error.message || `Failed to ${modalMode} depot`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await depotService.deleteDepot(id);
      if (response.success) {
        message.success("Depot deleted successfully");
        fetchDepots();
      }
    } catch (error) {
      console.error("Error deleting depot:", error);
      message.error(error.message || "Failed to delete depot");
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
            {record.company}
          </Text>
        </div>
      ),
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
      title: "Tax Details",
      key: "taxDetails",
      render: (_, record) => (
        <div>
          {record.gstNum && <div className="text-xs">GST: {record.gstNum}</div>}
          {record.panNum && <div className="text-xs">PAN: {record.panNum}</div>}
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
          {canEditDepot && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canDeleteDepot && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this depot?"
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
                icon={<HomeOutlined />}
                style={{ backgroundColor: "#eb2f96" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Depot Management
                </Title>
                <Text type="secondary">
                  Manage and monitor depots across different ports and regions
                </Text>
              </div>
            </Space>
          </Col>
          {canCreateDepot && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add Depot
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
              title="Total Depots"
              value={pagination.total}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Depots"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Inactive Depots"
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
              placeholder="Search depots..."
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
              onClick={fetchDepots}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Depots Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={depots}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Depot Form Modal */}
      <FormModal
        visible={isModalVisible}
        onCancel={closeModal}
        title={modalMode === "create" ? "Create New Depot" : "Edit Depot"}
        width={900}
      >
        <DepotForm
          initialValues={selectedDepot}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isLoading={formLoading}
        />
      </FormModal>
    </div>
  );
};

export default Depots;
