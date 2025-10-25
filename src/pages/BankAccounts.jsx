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
  BankOutlined,
  DollarOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FormModal from "../components/common/FormModal";
import BankAccountForm from "../components/forms/BankAccountForm";
import bankAccountService from "../services/bankAccountService";
import agentService from "../services/agentService";
import countryService from "../services/countryService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const BankAccounts = () => {
  const { hasPermission, activeRole } = useAuth();

  // Check if user can perform bank account operations based on roles
  const canCreateBankAccount =
    hasPermission("bank-accounts:create") ||
    ["ADMIN", "AGENT", "MASTER_AGENT"].includes(activeRole);
  const canEditBankAccount =
    hasPermission("bank-accounts:update") ||
    ["ADMIN", "AGENT", "MASTER_AGENT"].includes(activeRole);
  const canDeleteBankAccount =
    hasPermission("bank-accounts:delete") ||
    ["ADMIN", "MASTER_AGENT"].includes(activeRole);

  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [countries, setCountries] = useState([]);
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
    agentId: "",
    countryId: "",
  });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchBankAccounts();
    fetchAgents();
    fetchCountries();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchBankAccounts = async () => {
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

      const response = await bankAccountService.getAllBankAccounts(params);
      console.log(response);

      if (response.success) {
        setBankAccounts(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));

        // Update stats
        updateStats(response.data || []);
      } else {
        message.error("Failed to fetch bank accounts");
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      message.error("Failed to fetch bank accounts");
    } finally {
      setLoading(false);
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

  const fetchCountries = async () => {
    try {
      const response = await countryService.getAllCountries({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setCountries(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const updateStats = (bankAccountsData) => {
    const total = bankAccountsData.length;
    const active = bankAccountsData.filter(
      (bankAccount) => bankAccount.status === "ACTIVE"
    ).length;
    const inactive = bankAccountsData.filter(
      (bankAccount) => bankAccount.status === "INACTIVE"
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
      agentId: "",
      countryId: "",
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedBankAccount(null);
    setIsModalVisible(true);
  };

  const openEditModal = (bankAccount) => {
    setModalMode("edit");
    setSelectedBankAccount(bankAccount);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedBankAccount(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      setFormLoading(true);
      let response;

      if (modalMode === "create") {
        response = await bankAccountService.createBankAccount(values);
        message.success("Bank account created successfully");
      } else {
        response = await bankAccountService.updateBankAccount(
          selectedBankAccount.id,
          values
        );
        message.success("Bank account updated successfully");
      }

      if (response.success) {
        closeModal();
        fetchBankAccounts();
      }
    } catch (error) {
      console.error(
        `Error ${
          modalMode === "create" ? "creating" : "updating"
        } bank account:`,
        error
      );
      message.error(error.message || `Failed to ${modalMode} bank account`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await bankAccountService.deleteBankAccount(id);
      if (response.success) {
        message.success("Bank account deleted successfully");
        fetchBankAccounts();
      }
    } catch (error) {
      console.error("Error deleting bank account:", error);
      message.error(error.message || "Failed to delete bank account");
    }
  };

  const getStatusTag = (status) => {
    return <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>;
  };

  const columns = [
    {
      title: "Account Name",
      dataIndex: "accountName",
      key: "accountName",
      sorter: true,
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <Text type="secondary" className="text-xs">
            {record.accountNum}
          </Text>
        </div>
      ),
    },
    {
      title: "Agent",
      dataIndex: ["agent", "name"],
      key: "agent",
      render: (text, record) => (
        <div>
          <div>{record.agent?.name}</div>
          {record.agent?.code && (
            <Text type="secondary" className="text-xs">
              Code: {record.agent?.code}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Bank Details",
      key: "bankDetails",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.bankName}</div>
          {record.bankBranch && (
            <Text type="secondary" className="text-xs">
              Branch: {record.bankBranch}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Currency",
      dataIndex: ["currency", "name"],
      key: "currency",
      render: (text, record) => (
        <div>
          <div>{record.currency?.name}</div>
          <Text type="secondary" className="text-xs">
            {record.currency?.code}
          </Text>
        </div>
      ),
    },
    {
      title: "Country",
      dataIndex: ["country", "name"],
      key: "country",
      render: (text, record) => (
        <div>
          <div>{record.country?.name}</div>
          <Text type="secondary" className="text-xs">
            {record.country?.codeChar2}
          </Text>
        </div>
      ),
    },
    {
      title: "Swift/IFSC",
      key: "codes",
      render: (_, record) => (
        <div>
          {record.swiftCode && (
            <div>
              <Text strong>SWIFT:</Text> {record.swiftCode}
            </div>
          )}
          {record.ifscCode && (
            <div>
              <Text strong>IFSC:</Text> {record.ifscCode}
            </div>
          )}
          {!record.swiftCode && !record.ifscCode && "-"}
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
          {canEditBankAccount && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canDeleteBankAccount && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this bank account?"
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
                icon={<BankOutlined />}
                style={{ backgroundColor: "#722ed1" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Bank Account Management
                </Title>
                <Text type="secondary">
                  Manage and monitor bank accounts for different agents
                </Text>
              </div>
            </Space>
          </Col>
          {canCreateBankAccount && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add Bank Account
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
              title="Total Accounts"
              value={pagination.total}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Accounts"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Inactive Accounts"
              value={stats.inactive}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <Search
              placeholder="Search bank accounts..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
            />
          </Col>
          <Col xs={24} sm={8} md={5} lg={5} xl={5}>
            <Select
              placeholder="All Agents"
              allowClear
              value={filters.agentId}
              onChange={(value) => handleFilterChange("agentId", value)}
              className="w-full"
              showSearch
              filterOption={(input, option) => {
                const agent = agents.find((a) => a.id === option.value);
                if (!agent) return false;
                const searchableText = `${agent.name} ${
                  agent.code || ""
                }`.toLowerCase();
                return searchableText.indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {agents.map((agent) => (
                <Option key={agent.id} value={agent.id}>
                  {agent.name} {agent.code && `(${agent.code})`}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={5} lg={5} xl={5}>
            <Select
              placeholder="All Countries"
              allowClear
              value={filters.countryId}
              onChange={(value) => handleFilterChange("countryId", value)}
              className="w-full"
              showSearch
              filterOption={(input, option) => {
                const country = countries.find((c) => c.id === option.value);
                if (!country) return false;
                const searchableText = `${country.name}`.toLowerCase();
                return searchableText.indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {countries.map((country) => (
                <Option key={country.id} value={country.id}>
                  {country.name}
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
          <Col xs={24} sm={8} md={2} lg={2} xl={2}>
            <Button
              className="w-full"
              icon={<FilterOutlined />}
              onClick={clearFilters}
            >
              Clear
            </Button>
          </Col>
          <Col xs={24} sm={8} md={2} lg={2} xl={2}>
            <Button
              className="w-full"
              icon={<ReloadOutlined />}
              onClick={fetchBankAccounts}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bank Accounts Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={bankAccounts}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Bank Account Form Modal */}
      <FormModal
        visible={isModalVisible}
        onCancel={closeModal}
        title={
          modalMode === "create"
            ? "Create New Bank Account"
            : "Edit Bank Account"
        }
        width={900}
      >
        <BankAccountForm
          initialValues={selectedBankAccount}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isLoading={formLoading}
        />
      </FormModal>
    </div>
  );
};

export default BankAccounts;
