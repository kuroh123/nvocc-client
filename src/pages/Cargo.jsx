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
  InboxOutlined,
  GlobalOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FormModal from "../components/common/FormModal";
import CargoForm from "../components/forms/CargoForm";
import cargoService from "../services/cargoService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Cargo = () => {
  const { hasPermission, hasRole, activeRole } = useAuth();

  // Check if user can perform cargo operations based on roles
  const canCreateCargo =
    hasPermission("cargo:create") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canEditCargo =
    hasPermission("cargo:update") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canDeleteCargo =
    hasPermission("cargo:delete") ||
    ["ADMIN", "MASTER_PORT"].includes(activeRole);

  const [loading, setLoading] = useState(false);
  const [cargo, setCargo] = useState([]);
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
    search: undefined,
    status: undefined,
    cargoType: undefined,
  });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    containerCargo: 0,
  });

  useEffect(() => {
    fetchCargo();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchCargo = async () => {
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

      const response = await cargoService.getAllCargo(params);

      if (response.success) {
        setCargo(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));

        // Update stats
        updateStats(response.data || []);
      } else {
        message.error("Failed to fetch cargo");
      }
    } catch (error) {
      console.error("Error fetching cargo:", error);
      message.error("Failed to fetch cargo");
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (cargoData) => {
    const total = cargoData.length;
    const active = cargoData.filter((item) => item.status === "ACTIVE").length;
    const inactive = cargoData.filter(
      (item) => item.status === "INACTIVE"
    ).length;
    const containerCargo = cargoData.filter(
      (item) => item.cargoType === "CONTAINER"
    ).length;

    setStats({ total, active, inactive, containerCargo });
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
      cargoType: undefined,
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedCargo(null);
    setIsModalVisible(true);
  };

  const openEditModal = (cargoItem) => {
    setModalMode("edit");
    setSelectedCargo(cargoItem);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedCargo(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      setFormLoading(true);
      let response;

      if (modalMode === "create") {
        response = await cargoService.createCargo(values);
        message.success("Cargo created successfully");
      } else {
        response = await cargoService.updateCargo(selectedCargo.id, values);
        message.success("Cargo updated successfully");
      }

      if (response.success) {
        closeModal();
        fetchCargo();
      }
    } catch (error) {
      console.error(
        `Error ${modalMode === "create" ? "creating" : "updating"} cargo:`,
        error
      );
      message.error(error.message || `Failed to ${modalMode} cargo`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await cargoService.deleteCargo(id);
      if (response.success) {
        message.success("Cargo deleted successfully");
        fetchCargo();
      }
    } catch (error) {
      console.error("Error deleting cargo:", error);
      message.error(error.message || "Failed to delete cargo");
    }
  };

  const getCargoTypeTag = (cargoType) => {
    const types = {
      GENERAL: { color: "blue", label: "General" },
      CONTAINER: { color: "green", label: "Container" },
      BULK: { color: "orange", label: "Bulk" },
      LIQUID: { color: "cyan", label: "Liquid" },
      HAZARDOUS: { color: "red", label: "Hazardous" },
      REFRIGERATED: { color: "purple", label: "Refrigerated" },
      BREAKBULK: { color: "geekblue", label: "Break Bulk" },
    };

    return (
      <Tag color={types[cargoType]?.color || "default"}>
        {types[cargoType]?.label || cargoType}
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
      dataIndex: "cargoType",
      key: "cargoType",
      render: getCargoTypeTag,
      filters: [
        { text: "General", value: "GENERAL" },
        { text: "Container", value: "CONTAINER" },
        { text: "Bulk", value: "BULK" },
        { text: "Liquid", value: "LIQUID" },
        { text: "Hazardous", value: "HAZARDOUS" },
        { text: "Refrigerated", value: "REFRIGERATED" },
        { text: "Break Bulk", value: "BREAKBULK" },
      ],
    },
    {
      title: "Commodities",
      dataIndex: "commodities",
      key: "commodities",
      render: (commodities) => (
        <div>
          <span>{commodities?.length || 0}</span>
          {commodities?.length > 0 && (
            <Tooltip
              title={commodities
                .map((c) => `${c.name} (${c.code || "N/A"})`)
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
          {canEditCargo && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canDeleteCargo && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this cargo?"
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
                icon={<InboxOutlined />}
                style={{ backgroundColor: "#13c2c2" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Cargo Management
                </Title>
                <Text type="secondary">
                  Manage and monitor different types of cargo and commodities
                </Text>
              </div>
            </Space>
          </Col>
          {canCreateCargo && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add Cargo
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
              title="Total Cargo"
              value={pagination.total}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Cargo"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Inactive Cargo"
              value={stats.inactive}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Container Cargo"
              value={stats.containerCargo}
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={8} lg={6} xl={6}>
            <Search
              placeholder="Search cargo..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
            />
          </Col>
          <Col xs={24} sm={8} md={4} lg={4} xl={4}>
            <Select
              placeholder="All Types"
              allowClear
              value={filters.cargoType}
              onChange={(value) => handleFilterChange("cargoType", value)}
              className="w-full"
            >
              <Option value="GENERAL">General</Option>
              <Option value="CONTAINER">Container</Option>
              <Option value="BULK">Bulk</Option>
              <Option value="LIQUID">Liquid</Option>
              <Option value="HAZARDOUS">Hazardous</Option>
              <Option value="REFRIGERATED">Refrigerated</Option>
              <Option value="BREAKBULK">Break Bulk</Option>
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
              onClick={fetchCargo}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Cargo Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={cargo}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Cargo Form Modal */}
      <FormModal
        visible={isModalVisible}
        onCancel={closeModal}
        title={modalMode === "create" ? "Create New Cargo" : "Edit Cargo"}
        width={600}
      >
        <CargoForm
          initialValues={selectedCargo}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isLoading={formLoading}
        />
      </FormModal>
    </div>
  );
};

export default Cargo;
