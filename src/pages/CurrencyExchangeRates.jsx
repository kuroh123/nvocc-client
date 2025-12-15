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
  SwapOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FormModal from "../components/common/FormModal";
import CurrencyExchangeRateForm from "../components/forms/CurrencyExchangeRateForm";
import currencyExchangeRateService from "../services/currencyExchangeRateService";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const CurrencyExchangeRates = () => {
  const { hasPermission, hasRole, activeRole } = useAuth();

  // Check if user can perform operations based on roles
  const canCreate =
    hasPermission("currency-exchange-rates:create") ||
    ["ADMIN", "FINANCE"].includes(activeRole);
  const canEdit =
    hasPermission("currency-exchange-rates:update") ||
    ["ADMIN", "FINANCE"].includes(activeRole);
  const canDelete =
    hasPermission("currency-exchange-rates:delete") ||
    ["ADMIN"].includes(activeRole);

  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState([]);
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
  });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [selectedRate, setSelectedRate] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchRates();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchRates = async () => {
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

      const response =
        await currencyExchangeRateService.getAllCurrencyExchangeRates(params);

      if (response.success) {
        setRates(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));

        // Update stats
        updateStats(response.data || []);
      } else {
        message.error("Failed to fetch currency exchange rates");
      }
    } catch (error) {
      console.error("Error fetching currency exchange rates:", error);
      message.error("Failed to fetch currency exchange rates");
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (ratesData) => {
    const total = ratesData.length;
    const active = ratesData.filter((rate) => rate.status === "ACTIVE").length;
    const inactive = ratesData.filter(
      (rate) => rate.status === "INACTIVE"
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
      status: undefined,
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedRate(null);
    setIsModalVisible(true);
  };

  const openEditModal = (rate) => {
    setModalMode("edit");
    setSelectedRate(rate);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedRate(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      setFormLoading(true);
      let response;

      if (modalMode === "create") {
        response = await currencyExchangeRateService.createCurrencyExchangeRate(
          values
        );
        message.success("Currency exchange rate created successfully");
      } else {
        response = await currencyExchangeRateService.updateCurrencyExchangeRate(
          selectedRate.id,
          values
        );
        message.success("Currency exchange rate updated successfully");
      }

      if (response.success) {
        closeModal();
        fetchRates();
      }
    } catch (error) {
      console.error(
        `Error ${
          modalMode === "create" ? "creating" : "updating"
        } currency exchange rate:`,
        error
      );
      message.error(
        error.message || `Failed to ${modalMode} currency exchange rate`
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response =
        await currencyExchangeRateService.deleteCurrencyExchangeRate(id);
      if (response.success) {
        message.success("Currency exchange rate deleted successfully");
        fetchRates();
      }
    } catch (error) {
      console.error("Error deleting currency exchange rate:", error);
      message.error(error.message || "Failed to delete currency exchange rate");
    }
  };

  const getStatusTag = (status) => {
    return <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>;
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format("YYYY-MM-DD HH:mm");
  };

  const columns = [
    {
      title: "From Currency",
      dataIndex: ["fromCurrency", "code"],
      key: "fromCurrency",
      render: (text, record) => (
        <div>
          <div className="font-medium">{record.fromCurrency?.code}</div>
          <Text type="secondary" className="text-xs">
            {record.fromCurrency?.name}
          </Text>
        </div>
      ),
    },
    {
      title: "To Currency",
      dataIndex: ["toCurrency", "code"],
      key: "toCurrency",
      render: (text, record) => (
        <div>
          <div className="font-medium">{record.toCurrency?.code}</div>
          <Text type="secondary" className="text-xs">
            {record.toCurrency?.name}
          </Text>
        </div>
      ),
    },
    {
      title: "Exchange Rate",
      dataIndex: "exchangeRate",
      key: "exchangeRate",
      render: (rate) => <span className="font-medium">{rate?.toFixed(6)}</span>,
    },
    {
      title: "Lower Rate",
      dataIndex: "lowerRate",
      key: "lowerRate",
      render: (rate) => (rate ? rate.toFixed(6) : "-"),
    },
    {
      title: "Upper Rate",
      dataIndex: "upperRate",
      key: "upperRate",
      render: (rate) => (rate ? rate.toFixed(6) : "-"),
    },
    {
      title: "Valid From",
      dataIndex: "validFromDt",
      key: "validFromDt",
      render: formatDate,
      sorter: true,
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
          {canEdit && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this exchange rate?"
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
                icon={<SwapOutlined />}
                style={{ backgroundColor: "#1890ff" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Currency Exchange Rates
                </Title>
                <Text type="secondary">
                  Manage currency exchange rates for international transactions
                </Text>
              </div>
            </Space>
          </Col>
          {canCreate && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add Exchange Rate
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
              title="Total Rates"
              value={pagination.total}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Rates"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Inactive Rates"
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
              placeholder="Search exchange rates..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
            />
          </Col>
          <Col xs={24} sm={8} md={6} lg={4} xl={4}>
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
          <Col xs={24} sm={8} md={6} lg={4} xl={4}>
            <Button
              className="w-full"
              icon={<FilterOutlined />}
              onClick={clearFilters}
            >
              Clear
            </Button>
          </Col>
          <Col xs={24} sm={8} md={6} lg={4} xl={4}>
            <Button
              className="w-full"
              icon={<ReloadOutlined />}
              onClick={fetchRates}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Exchange Rates Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={rates}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Exchange Rate Form Modal */}
      <FormModal
        visible={isModalVisible}
        onCancel={closeModal}
        title={
          modalMode === "create"
            ? "Create New Exchange Rate"
            : "Edit Exchange Rate"
        }
        width={800}
      >
        <CurrencyExchangeRateForm
          initialValues={selectedRate}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isLoading={formLoading}
        />
      </FormModal>
    </div>
  );
};

export default CurrencyExchangeRates;
