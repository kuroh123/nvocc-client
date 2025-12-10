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
  DollarOutlined,
  GlobalOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FormModal from "../components/common/FormModal";
import ChargeForm from "../components/forms/ChargeForm";
import chargeService from "../services/chargeService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Charges = () => {
  const { hasPermission, hasRole, activeRole } = useAuth();

  // Check if user can perform charge operations based on roles
  const canCreateCharge =
    hasPermission("charges:create") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canEditCharge =
    hasPermission("charges:update") ||
    ["ADMIN", "PORT", "MASTER_PORT"].includes(activeRole);
  const canDeleteCharge =
    hasPermission("charges:delete") ||
    ["ADMIN", "MASTER_PORT"].includes(activeRole);

  const [loading, setLoading] = useState(false);
  const [charges, setCharges] = useState([]);
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
  });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchCharges();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchCharges = async () => {
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

      const response = await chargeService.getAllCharges(params);

      if (response.success) {
        setCharges(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));

        // Update stats
        updateStats(response.data || []);
      } else {
        message.error("Failed to fetch charges");
      }
    } catch (error) {
      console.error("Error fetching charges:", error);
      message.error("Failed to fetch charges");
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (chargesData) => {
    const total = chargesData.length;
    const active = chargesData.filter(
      (charge) => charge.status === "ACTIVE"
    ).length;
    const inactive = chargesData.filter(
      (charge) => charge.status === "INACTIVE"
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
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedCharge(null);
    setIsModalVisible(true);
  };

  const openEditModal = (charge) => {
    setModalMode("edit");
    setSelectedCharge(charge);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedCharge(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      setFormLoading(true);
      let response;

      if (modalMode === "create") {
        response = await chargeService.createCharge(values);
        message.success("Charge created successfully");
      } else {
        response = await chargeService.updateCharge(selectedCharge.id, values);
        message.success("Charge updated successfully");
      }

      if (response.success) {
        closeModal();
        fetchCharges();
      }
    } catch (error) {
      console.error(
        `Error ${modalMode === "create" ? "creating" : "updating"} charge:`,
        error
      );
      message.error(error.message || `Failed to ${modalMode} charge`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await chargeService.deleteCharge(id);
      if (response.success) {
        message.success("Charge deleted successfully");
        fetchCharges();
      }
    } catch (error) {
      console.error("Error deleting charge:", error);
      message.error(error.message || "Failed to delete charge");
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
            {record.displayName}
          </Text>
        </div>
      ),
    },
    {
      title: "SAC/HSN Code",
      dataIndex: "sacHsnCode",
      key: "sacHsnCode",
      render: (text) => text || "-",
    },
    {
      title: "Flag",
      dataIndex: "flag",
      key: "flag",
      render: (text) => text || "-",
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (text) => (
        <div className="max-w-xs">
          {text ? (
            <Tooltip title={text}>
              <div className="truncate">{text}</div>
            </Tooltip>
          ) : (
            "-"
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
          {canEditCharge && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canDeleteCharge && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this charge?"
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
                icon={<DollarOutlined />}
                style={{ backgroundColor: "#fa8c16" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Charge Management
                </Title>
                <Text type="secondary">
                  Manage and monitor charges used in shipping operations
                </Text>
              </div>
            </Space>
          </Col>
          {canCreateCharge && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add Charge
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
              title="Total Charges"
              value={pagination.total}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Charges"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Inactive Charges"
              value={stats.inactive}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Search
              placeholder="Search charges..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
            />
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
              onClick={fetchCharges}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Charges Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={charges}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Charge Form Modal */}
      <FormModal
        visible={isModalVisible}
        onCancel={closeModal}
        title={modalMode === "create" ? "Create New Charge" : "Edit Charge"}
        width={700}
      >
        <ChargeForm
          initialValues={selectedCharge}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isLoading={formLoading}
        />
      </FormModal>
    </div>
  );
};

export default Charges;
