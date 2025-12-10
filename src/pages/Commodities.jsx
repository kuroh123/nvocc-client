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
  TagsOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FormModal from "../components/common/FormModal";
import CommodityForm from "../components/forms/CommodityForm";
import commodityService from "../services/commodityService";
import cargoService from "../services/cargoService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Commodities = () => {
  const { hasPermission, activeRole } = useAuth();

  // Check if user can perform commodity operations based on roles
  const canCreateCommodity =
    hasPermission("commodities:create") ||
    ["ADMIN", "CARGO", "MASTER_CARGO"].includes(activeRole);
  const canEditCommodity =
    hasPermission("commodities:update") ||
    ["ADMIN", "CARGO", "MASTER_CARGO"].includes(activeRole);
  const canDeleteCommodity =
    hasPermission("commodities:delete") ||
    ["ADMIN", "MASTER_CARGO"].includes(activeRole);

  const [loading, setLoading] = useState(false);
  const [commodities, setCommodities] = useState([]);
  const [cargos, setCargos] = useState([]);
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
    cargoId: "",
  });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [selectedCommodity, setSelectedCommodity] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchCommodities();
    fetchCargos();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchCommodities = async () => {
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

      const response = await commodityService.getAllCommodities(params);
      console.log(response);

      if (response.success) {
        setCommodities(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));

        // Update stats
        updateStats(response.data || []);
      } else {
        message.error("Failed to fetch commodities");
      }
    } catch (error) {
      console.error("Error fetching commodities:", error);
      message.error("Failed to fetch commodities");
    } finally {
      setLoading(false);
    }
  };

  const fetchCargos = async () => {
    try {
      const response = await cargoService.getAllCargo({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setCargos(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching cargos:", error);
    }
  };

  const updateStats = (commoditiesData) => {
    const total = commoditiesData.length;
    const active = commoditiesData.filter(
      (commodity) => commodity.status === "ACTIVE"
    ).length;
    const inactive = commoditiesData.filter(
      (commodity) => commodity.status === "INACTIVE"
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
      cargoId: "",
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedCommodity(null);
    setIsModalVisible(true);
  };

  const openEditModal = (commodity) => {
    setModalMode("edit");
    setSelectedCommodity(commodity);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedCommodity(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      setFormLoading(true);
      let response;

      if (modalMode === "create") {
        response = await commodityService.createCommodity(values);
        message.success("Commodity created successfully");
      } else {
        response = await commodityService.updateCommodity(
          selectedCommodity.id,
          values
        );
        message.success("Commodity updated successfully");
      }

      if (response.success) {
        closeModal();
        fetchCommodities();
      }
    } catch (error) {
      console.error(
        `Error ${modalMode === "create" ? "creating" : "updating"} commodity:`,
        error
      );
      message.error(error.message || `Failed to ${modalMode} commodity`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await commodityService.deleteCommodity(id);
      if (response.success) {
        message.success("Commodity deleted successfully");
        fetchCommodities();
      }
    } catch (error) {
      console.error("Error deleting commodity:", error);
      message.error(error.message || "Failed to delete commodity");
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
          {record.code && (
            <Text type="secondary" className="text-xs">
              Code: {record.code}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Cargo",
      dataIndex: ["cargo", "name"],
      key: "cargo",
      render: (text, record) => (
        <div>
          <div>{record.cargo?.name}</div>
          {record.cargo?.code && (
            <Text type="secondary" className="text-xs">
              Code: {record.cargo?.code}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
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
          {canEditCommodity && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canDeleteCommodity && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this commodity?"
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
                icon={<TagsOutlined />}
                style={{ backgroundColor: "#52c41a" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Commodity Management
                </Title>
                <Text type="secondary">
                  Manage and monitor commodities across different cargo types
                </Text>
              </div>
            </Space>
          </Col>
          {canCreateCommodity && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add Commodity
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
              title="Total Commodities"
              value={pagination.total}
              prefix={<TagsOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Commodities"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Inactive Commodities"
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
              placeholder="Search commodities..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
            />
          </Col>
          <Col xs={24} sm={8} md={6} lg={6} xl={6}>
            <Select
              placeholder="All Cargos"
              allowClear
              value={filters.cargoId}
              onChange={(value) => handleFilterChange("cargoId", value)}
              className="w-full"
              showSearch
              filterOption={(input, option) => {
                const cargo = cargos.find((c) => c.id === option.value);
                if (!cargo) return false;
                const searchableText = `${cargo.name} ${
                  cargo.code || ""
                }`.toLowerCase();
                return searchableText.indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {cargos.map((cargo) => (
                <Option key={cargo.id} value={cargo.id}>
                  {cargo.name} {cargo.code && `(${cargo.code})`}
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
              onClick={fetchCommodities}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Commodities Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={commodities}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Commodity Form Modal */}
      <FormModal
        visible={isModalVisible}
        onCancel={closeModal}
        title={
          modalMode === "create" ? "Create New Commodity" : "Edit Commodity"
        }
        width={800}
      >
        <CommodityForm
          initialValues={selectedCommodity}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isLoading={formLoading}
        />
      </FormModal>
    </div>
  );
};

export default Commodities;
