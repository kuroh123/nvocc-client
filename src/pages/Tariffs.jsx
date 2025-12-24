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
  FundOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FormModal from "../components/common/FormModal";
import TariffForm from "../components/forms/TariffForm";
import tariffService from "../services/tariffService";
import containerTypeService from "../services/containerTypeService";
import agentService from "../services/agentService";
import portService from "../services/portService";
import terminalService from "../services/terminalService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Tariffs = () => {
  const { hasPermission, activeRole } = useAuth();

  // Check if user can perform tariff operations based on roles
  const canCreateTariff =
    hasPermission("tariffs:create") ||
    ["ADMIN", "TARIFF", "MASTER_TARIFF"].includes(activeRole);
  const canEditTariff =
    hasPermission("tariffs:update") ||
    ["ADMIN", "TARIFF", "MASTER_TARIFF"].includes(activeRole);
  const canDeleteTariff =
    hasPermission("tariffs:delete") ||
    ["ADMIN", "MASTER_TARIFF"].includes(activeRole);

  const [loading, setLoading] = useState(false);
  const [tariffs, setTariffs] = useState([]);
  const [containerTypes, setContainerTypes] = useState([]);
  const [agents, setAgents] = useState([]);
  const [ports, setPorts] = useState([]);
  const [terminals, setTerminals] = useState([]);
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
    eventType: "",
    productType: "",
    containerTypeId: "",
  });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    import: 0,
    export: 0,
    handling: 0,
  });

  useEffect(() => {
    fetchTariffs();
    fetchContainerTypes();
    fetchAgents();
    fetchPorts();
    fetchTerminals();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchTariffs = async () => {
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

      const response = await tariffService.getAllTariffs(params);
      console.log(response);

      if (response.success) {
        setTariffs(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));

        // Update stats
        updateStats(response.data || []);
      } else {
        message.error("Failed to fetch tariffs");
      }
    } catch (error) {
      console.error("Error fetching tariffs:", error);
      message.error("Failed to fetch tariffs");
    } finally {
      setLoading(false);
    }
  };

  const fetchContainerTypes = async () => {
    try {
      const response = await containerTypeService.getAllContainerTypes({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setContainerTypes(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching container types:", error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await agentService.getAllAgents({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setAgents(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
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

  const fetchTerminals = async () => {
    try {
      const response = await terminalService.getAllTerminals({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setTerminals(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching terminals:", error);
    }
  };

  const updateStats = (tariffsData) => {
    const total = tariffsData.length;
    const importTariffs = tariffsData.filter(
      (tariff) => tariff.eventType === "IMPORT"
    ).length;
    const exportTariffs = tariffsData.filter(
      (tariff) => tariff.eventType === "EXPORT"
    ).length;
    const handlingTariffs = tariffsData.filter(
      (tariff) => tariff.eventType === "HANDLING"
    ).length;

    setStats({
      total,
      import: importTariffs,
      export: exportTariffs,
      handling: handlingTariffs,
    });
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
      eventType: "",
      productType: "",
      containerTypeId: "",
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedTariff(null);
    setIsModalVisible(true);
  };

  const openEditModal = (tariff) => {
    setModalMode("edit");
    setSelectedTariff(tariff);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedTariff(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      setFormLoading(true);
      let response;

      if (modalMode === "create") {
        response = await tariffService.createTariff(values);
        message.success("Tariff created successfully");
      } else {
        response = await tariffService.updateTariff(selectedTariff.id, values);
        message.success("Tariff updated successfully");
      }

      if (response.success) {
        closeModal();
        fetchTariffs();
      }
    } catch (error) {
      console.error(
        `Error ${modalMode === "create" ? "creating" : "updating"} tariff:`,
        error
      );
      message.error(error.message || `Failed to ${modalMode} tariff`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await tariffService.deleteTariff(id);
      if (response.success) {
        message.success("Tariff deleted successfully");
        fetchTariffs();
      }
    } catch (error) {
      console.error("Error deleting tariff:", error);
      message.error(error.message || "Failed to delete tariff");
    }
  };

  const getEventTypeTag = (eventType) => {
    const types = {
      IMPORT: { color: "blue", label: "Import" },
      EXPORT: { color: "green", label: "Export" },
      HANDLING: { color: "orange", label: "Handling" },
      STORAGE: { color: "purple", label: "Storage" },
      TRANSPORT: { color: "cyan", label: "Transport" },
    };

    return (
      <Tag color={types[eventType]?.color || "default"}>
        {types[eventType]?.label || eventType}
      </Tag>
    );
  };

  const getProductTypeTag = (productType) => {
    const types = {
      CONTAINER: { color: "blue", label: "Container" },
      CARGO: { color: "green", label: "Cargo" },
      VESSEL: { color: "purple", label: "Vessel" },
      SERVICE: { color: "orange", label: "Service" },
    };

    return (
      <Tag color={types[productType]?.color || "default"}>
        {types[productType]?.label || productType}
      </Tag>
    );
  };

  const columns = [
    {
      title: "Event Type",
      dataIndex: "eventType",
      key: "eventType",
      render: getEventTypeTag,
      filters: [
        { text: "Import", value: "IMPORT" },
        { text: "Export", value: "EXPORT" },
        { text: "Handling", value: "HANDLING" },
        { text: "Storage", value: "STORAGE" },
        { text: "Transport", value: "TRANSPORT" },
      ],
    },
    {
      title: "Product Type",
      dataIndex: "productType",
      key: "productType",
      render: getProductTypeTag,
      filters: [
        { text: "Container", value: "CONTAINER" },
        { text: "Cargo", value: "CARGO" },
        { text: "Vessel", value: "VESSEL" },
        { text: "Service", value: "SERVICE" },
      ],
    },
    {
      title: "Container Type",
      dataIndex: ["containerType", "name"],
      key: "containerType",
      render: (text, record) => (
        <div>
          <div>{record.containerType?.name}</div>
          <Text type="secondary" className="text-xs">
            {record.containerType?.isoCode}
          </Text>
        </div>
      ),
    },
    {
      title: "Charge",
      dataIndex: ["charge", "name"],
      key: "charge",
      render: (text, record) => (
        <div>
          <div>{record.charge?.name}</div>
          <Text type="secondary" className="text-xs">
            {record.containerType?.sacHsnCode}
          </Text>
        </div>
      ),
    },

    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      sorter: true,
    },
    {
      title: "Pickup Details",
      key: "pickupDetails",
      render: (_, record) => (
        <div>
          {record.pickAgent && (
            <div>
              <Text strong>Agent:</Text> {record.pickAgent.name}
            </div>
          )}
          {record.pickPort && (
            <div>
              <Text strong>Port:</Text> {record.pickPort.name}
            </div>
          )}
          {record.pickTerminal && (
            <div>
              <Text strong>Terminal:</Text> {record.pickTerminal.name}
            </div>
          )}
          {!record.pickAgent && !record.pickPort && !record.pickTerminal && "-"}
        </div>
      ),
    },
    {
      title: "Next Details",
      key: "nextDetails",
      render: (_, record) => (
        <div>
          {record.nextAgent && (
            <div>
              <Text strong>Agent:</Text> {record.nextAgent.name}
            </div>
          )}
          {record.nextPort && (
            <div>
              <Text strong>Port:</Text> {record.nextPort.name}
            </div>
          )}
          {record.nextTerminal && (
            <div>
              <Text strong>Terminal:</Text> {record.nextTerminal.name}
            </div>
          )}
          {!record.nextAgent && !record.nextPort && !record.nextTerminal && "-"}
        </div>
      ),
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
          {canEditTariff && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canDeleteTariff && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this tariff?"
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
                icon={<FundOutlined />}
                style={{ backgroundColor: "#f5222d" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Tariff Management
                </Title>
                <Text type="secondary">
                  Manage and monitor tariffs for different container types and
                  services
                </Text>
              </div>
            </Space>
          </Col>
          {canCreateTariff && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add Tariff
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
              title="Total Tariffs"
              value={pagination.total}
              prefix={<FundOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Import Tariffs"
              value={stats.import}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Export Tariffs"
              value={stats.export}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Handling Tariffs"
              value={stats.handling}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <Search
              placeholder="Search tariffs..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
            />
          </Col>
          <Col xs={24} sm={8} md={4} lg={4} xl={4}>
            <Select
              placeholder="Event Type"
              allowClear
              value={filters.eventType}
              onChange={(value) => handleFilterChange("eventType", value)}
              className="w-full"
            >
              <Option value="IMPORT">Import</Option>
              <Option value="EXPORT">Export</Option>
              <Option value="HANDLING">Handling</Option>
              <Option value="STORAGE">Storage</Option>
              <Option value="TRANSPORT">Transport</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4} lg={4} xl={4}>
            <Select
              placeholder="Product Type"
              allowClear
              value={filters.productType}
              onChange={(value) => handleFilterChange("productType", value)}
              className="w-full"
            >
              <Option value="CONTAINER">Container</Option>
              <Option value="CARGO">Cargo</Option>
              <Option value="VESSEL">Vessel</Option>
              <Option value="SERVICE">Service</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4} lg={4} xl={4}>
            <Select
              placeholder="Container Type"
              allowClear
              value={filters.containerTypeId}
              onChange={(value) => handleFilterChange("containerTypeId", value)}
              className="w-full"
              showSearch
              filterOption={(input, option) => {
                const containerType = containerTypes.find(
                  (ct) => ct.id === option.value
                );
                if (!containerType) return false;
                const searchableText = `${containerType.name} ${
                  containerType.isoCode || ""
                }`.toLowerCase();
                return searchableText.indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {containerTypes.map((containerType) => (
                <Option key={containerType.id} value={containerType.id}>
                  {containerType.name} ({containerType.isoCode})
                </Option>
              ))}
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
              onClick={fetchTariffs}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tariffs Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={tariffs}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Tariff Form Modal */}
      <FormModal
        visible={isModalVisible}
        onCancel={closeModal}
        title={modalMode === "create" ? "Create New Tariff" : "Edit Tariff"}
        width={1000}
      >
        <TariffForm
          initialValues={selectedTariff}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isLoading={formLoading}
        />
      </FormModal>
    </div>
  );
};

export default Tariffs;
