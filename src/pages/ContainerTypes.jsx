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
  ContainerOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FormModal from "../components/common/FormModal";
import ContainerTypeForm from "../components/forms/ContainerTypeForm";
import containerTypeService from "../services/containerTypeService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ContainerTypes = () => {
  const { hasPermission, activeRole } = useAuth();

  // Check if user can perform container type operations based on roles
  const canCreateContainerType =
    hasPermission("container-types:create") ||
    ["ADMIN", "CONTAINER", "MASTER_CONTAINER"].includes(activeRole);
  const canEditContainerType =
    hasPermission("container-types:update") ||
    ["ADMIN", "CONTAINER", "MASTER_CONTAINER"].includes(activeRole);
  const canDeleteContainerType =
    hasPermission("container-types:delete") ||
    ["ADMIN", "MASTER_CONTAINER"].includes(activeRole);

  const [loading, setLoading] = useState(false);
  const [containerTypes, setContainerTypes] = useState([]);
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

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [selectedContainerType, setSelectedContainerType] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    dryContainer: 0,
    reeferContainer: 0,
  });

  useEffect(() => {
    fetchContainerTypes();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchContainerTypes = async () => {
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

      const response = await containerTypeService.getAllContainerTypes(params);
      console.log(response);

      if (response.success) {
        setContainerTypes(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));

        // Update stats
        updateStats(response.data || []);
      } else {
        message.error("Failed to fetch container types");
      }
    } catch (error) {
      console.error("Error fetching container types:", error);
      message.error("Failed to fetch container types");
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (containerTypesData) => {
    const total = containerTypesData.length;
    const active = containerTypesData.filter(
      (containerType) => containerType.status === "ACTIVE"
    ).length;
    const inactive = containerTypesData.filter(
      (containerType) => containerType.status === "INACTIVE"
    ).length;
    const dryContainer = containerTypesData.filter(
      (containerType) => containerType.type === "DRY_CONTAINER"
    ).length;
    const reeferContainer = containerTypesData.filter(
      (containerType) => containerType.type === "REEFER_CONTAINER"
    ).length;

    setStats({ total, active, inactive, dryContainer, reeferContainer });
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
    setSelectedContainerType(null);
    setIsModalVisible(true);
  };

  const openEditModal = (containerType) => {
    setModalMode("edit");
    setSelectedContainerType(containerType);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedContainerType(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      setFormLoading(true);
      let response;

      if (modalMode === "create") {
        response = await containerTypeService.createContainerType(values);
        message.success("Container type created successfully");
      } else {
        response = await containerTypeService.updateContainerType(
          selectedContainerType.id,
          values
        );
        message.success("Container type updated successfully");
      }

      if (response.success) {
        closeModal();
        fetchContainerTypes();
      }
    } catch (error) {
      console.error(
        `Error ${
          modalMode === "create" ? "creating" : "updating"
        } container type:`,
        error
      );
      message.error(error.message || `Failed to ${modalMode} container type`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await containerTypeService.deleteContainerType(id);
      if (response.success) {
        message.success("Container type deleted successfully");
        fetchContainerTypes();
      }
    } catch (error) {
      console.error("Error deleting container type:", error);
      message.error(error.message || "Failed to delete container type");
    }
  };

  const getTypeTag = (type) => {
    const types = {
      DRY_CONTAINER: { color: "blue", label: "Dry Container" },
      REEFER_CONTAINER: { color: "cyan", label: "Reefer Container" },
      TANK_CONTAINER: { color: "green", label: "Tank Container" },
      FLAT_RACK: { color: "purple", label: "Flat Rack" },
      OPEN_TOP: { color: "orange", label: "Open Top" },
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
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.isoCode && (
            <Text type="secondary" className="text-xs">
              ISO: {record.isoCode}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: getTypeTag,
      filters: [
        { text: "Dry Container", value: "DRY_CONTAINER" },
        { text: "Reefer Container", value: "REEFER_CONTAINER" },
        { text: "Tank Container", value: "TANK_CONTAINER" },
        { text: "Flat Rack", value: "FLAT_RACK" },
        { text: "Open Top", value: "OPEN_TOP" },
      ],
    },
    {
      title: "ISO Code",
      dataIndex: "isoCode",
      key: "isoCode",
      render: (text) => text || "-",
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (text) =>
        text ? (
          <div className="max-w-xs">
            {text.length > 50 ? `${text.substring(0, 50)}...` : text}
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "Tariffs",
      dataIndex: "tariffs",
      key: "tariffs",
      render: (tariffs) => (
        <div>
          <span>{tariffs?.length || 0}</span>
          {tariffs?.length > 0 && (
            <Tooltip
              title={tariffs
                .map((t) => `${t.eventType} - ${t.productType} (Qty: ${t.qty})`)
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
          {canEditContainerType && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canDeleteContainerType && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this container type?"
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
                icon={<ContainerOutlined />}
                style={{ backgroundColor: "#1890ff" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Container Type Management
                </Title>
                <Text type="secondary">
                  Manage and monitor different types of containers and their
                  specifications
                </Text>
              </div>
            </Space>
          </Col>
          {canCreateContainerType && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add Container Type
              </Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={5}>
          <Card>
            <Statistic
              title="Total Types"
              value={pagination.total}
              prefix={<ContainerOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Active Types"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Inactive Types"
              value={stats.inactive}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Dry Containers"
              value={stats.dryContainer}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Reefer Containers"
              value={stats.reeferContainer}
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Search
              placeholder="Search container types..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
            />
          </Col>
          <Col xs={24} sm={8} md={6} lg={6} xl={6}>
            <Select
              placeholder="All Types"
              allowClear
              value={filters.type}
              onChange={(value) => handleFilterChange("type", value)}
              className="w-full"
            >
              <Option value="DRY_CONTAINER">Dry Container</Option>
              <Option value="REEFER_CONTAINER">Reefer Container</Option>
              <Option value="TANK_CONTAINER">Tank Container</Option>
              <Option value="FLAT_RACK">Flat Rack</Option>
              <Option value="OPEN_TOP">Open Top</Option>
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
              onClick={fetchContainerTypes}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Container Types Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={containerTypes}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Container Type Form Modal */}
      <FormModal
        visible={isModalVisible}
        onCancel={closeModal}
        title={
          modalMode === "create"
            ? "Create New Container Type"
            : "Edit Container Type"
        }
        width={800}
      >
        <ContainerTypeForm
          initialValues={selectedContainerType}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isLoading={formLoading}
        />
      </FormModal>
    </div>
  );
};

export default ContainerTypes;
