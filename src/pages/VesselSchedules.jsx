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
  CalendarOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FormModal from "../components/common/FormModal";
import VesselScheduleForm from "../components/forms/VesselScheduleForm";
import vesselScheduleService from "../services/vesselScheduleService";
import vesselService from "../services/vesselService";
import terminalService from "../services/terminalService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const VesselSchedules = () => {
  const { hasPermission, activeRole } = useAuth();

  // Check if user can perform vessel schedule operations based on roles
  const canCreateVesselSchedule =
    hasPermission("vessel-schedules:create") ||
    ["ADMIN", "VESSEL", "MASTER_VESSEL"].includes(activeRole);
  const canEditVesselSchedule =
    hasPermission("vessel-schedules:update") ||
    ["ADMIN", "VESSEL", "MASTER_VESSEL"].includes(activeRole);
  const canDeleteVesselSchedule =
    hasPermission("vessel-schedules:delete") ||
    ["ADMIN", "MASTER_VESSEL"].includes(activeRole);

  const [loading, setLoading] = useState(false);
  const [vesselSchedules, setVesselSchedules] = useState([]);
  const [vessels, setVessels] = useState([]);
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
    vesselId: "",
    pickupTerminalId: "",
    nextPortTerminalId: "",
  });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create or edit
  const [selectedVesselSchedule, setSelectedVesselSchedule] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    nextMonth: 0,
    withETA: 0,
  });

  useEffect(() => {
    fetchVesselSchedules();
    fetchVessels();
    fetchTerminals();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchVesselSchedules = async () => {
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

      const response = await vesselScheduleService.getAllVesselSchedules(
        params
      );
      console.log(response);

      if (response.success) {
        setVesselSchedules(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));

        // Update stats
        updateStats(response.data || []);
      } else {
        message.error("Failed to fetch vessel schedules");
      }
    } catch (error) {
      console.error("Error fetching vessel schedules:", error);
      message.error("Failed to fetch vessel schedules");
    } finally {
      setLoading(false);
    }
  };

  const fetchVessels = async () => {
    try {
      const response = await vesselService.getAllVessels({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setVessels(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching vessels:", error);
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

  const updateStats = (vesselSchedulesData) => {
    const total = vesselSchedulesData.length;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const thisMonth = vesselSchedulesData.filter((schedule) => {
      if (!schedule.etaDt) return false;
      const etaDate = new Date(schedule.etaDt);
      return (
        etaDate.getMonth() === currentMonth &&
        etaDate.getFullYear() === currentYear
      );
    }).length;

    const nextMonth = vesselSchedulesData.filter((schedule) => {
      if (!schedule.etaDt) return false;
      const etaDate = new Date(schedule.etaDt);
      const nextMonthDate = new Date(currentYear, currentMonth + 1);
      return (
        etaDate.getMonth() === nextMonthDate.getMonth() &&
        etaDate.getFullYear() === nextMonthDate.getFullYear()
      );
    }).length;

    const withETA = vesselSchedulesData.filter(
      (schedule) => schedule.etaDt
    ).length;

    setStats({ total, thisMonth, nextMonth, withETA });
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
      vesselId: "",
      pickupTerminalId: "",
      nextPortTerminalId: "",
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedVesselSchedule(null);
    setIsModalVisible(true);
  };

  const openEditModal = (vesselSchedule) => {
    setModalMode("edit");
    setSelectedVesselSchedule(vesselSchedule);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedVesselSchedule(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      setFormLoading(true);
      let response;

      if (modalMode === "create") {
        response = await vesselScheduleService.createVesselSchedule(values);
        message.success("Vessel schedule created successfully");
      } else {
        response = await vesselScheduleService.updateVesselSchedule(
          selectedVesselSchedule.id,
          values
        );
        message.success("Vessel schedule updated successfully");
      }

      if (response.success) {
        closeModal();
        fetchVesselSchedules();
      }
    } catch (error) {
      console.error(
        `Error ${
          modalMode === "create" ? "creating" : "updating"
        } vessel schedule:`,
        error
      );
      message.error(error.message || `Failed to ${modalMode} vessel schedule`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await vesselScheduleService.deleteVesselSchedule(id);
      if (response.success) {
        message.success("Vessel schedule deleted successfully");
        fetchVesselSchedules();
      }
    } catch (error) {
      console.error("Error deleting vessel schedule:", error);
      message.error(error.message || "Failed to delete vessel schedule");
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleString();
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const columns = [
    {
      title: "Vessel",
      dataIndex: ["vessel", "name"],
      key: "vessel",
      render: (text, record) => (
        <div>
          <div className="font-medium">{record.vessel?.name}</div>
          {record.voyage && (
            <Text type="secondary" className="text-xs">
              Voyage: {record.voyage}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Service",
      dataIndex: "serviceName",
      key: "serviceName",
      render: (text) => text || "-",
    },
    {
      title: "ETA",
      dataIndex: "etaDt",
      key: "etaDt",
      render: formatDateTime,
      sorter: true,
    },
    {
      title: "ETD",
      dataIndex: "etdDt",
      key: "etdDt",
      render: formatDateTime,
      sorter: true,
    },
    {
      title: "Pickup Terminal",
      dataIndex: ["pickupTerminal", "name"],
      key: "pickupTerminal",
      render: (text, record) => (
        <div>
          <div>
            {record.pickupTerminal?.name || record.pickupLocation || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Next Port Terminal",
      dataIndex: ["nextPortTerminal", "name"],
      key: "nextPortTerminal",
      render: (text, record) => (
        <div>
          <div>
            {record.nextPortTerminal?.name || record.nextPortLocation || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Cut Off",
      dataIndex: "cutOff",
      key: "cutOff",
      render: formatDateTime,
    },
    {
      title: "Gate Open",
      dataIndex: "gateOpen",
      key: "gateOpen",
      render: formatDateTime,
    },
    {
      title: "Space",
      key: "space",
      render: (_, record) => (
        <div>
          {record.space20ft && (
            <div>
              <Text strong>20ft:</Text> {record.space20ft}
            </div>
          )}
          {record.space40ft && (
            <div>
              <Text strong>40ft:</Text> {record.space40ft}
            </div>
          )}
          {!record.space20ft && !record.space40ft && "-"}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const now = new Date();
        const eta = record.etaDt ? new Date(record.etaDt) : null;
        const etd = record.etdDt ? new Date(record.etdDt) : null;

        if (record.ataDt) {
          return <Tag color="green">Arrived</Tag>;
        } else if (eta && now > eta) {
          return <Tag color="orange">Overdue</Tag>;
        } else if (eta && now < eta) {
          return <Tag color="blue">Scheduled</Tag>;
        } else {
          return <Tag color="default">Unknown</Tag>;
        }
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDate,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="link" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          {canEditVesselSchedule && (
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}
          {canDeleteVesselSchedule && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this vessel schedule?"
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
                icon={<CalendarOutlined />}
                style={{ backgroundColor: "#13c2c2" }}
                size="large"
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Vessel Schedule Management
                </Title>
                <Text type="secondary">
                  Manage and monitor vessel schedules and their
                  arrival/departure times
                </Text>
              </div>
            </Space>
          </Col>
          {canCreateVesselSchedule && (
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add Vessel Schedule
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
              title="Total Schedules"
              value={pagination.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="This Month"
              value={stats.thisMonth}
              valueStyle={{ color: "#1890ff" }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Next Month"
              value={stats.nextMonth}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="With ETA"
              value={stats.withETA}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <Search
              placeholder="Search schedules..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
            />
          </Col>
          <Col xs={24} sm={8} md={5} lg={5} xl={5}>
            <Select
              placeholder="All Vessels"
              allowClear
              value={filters.vesselId}
              onChange={(value) => handleFilterChange("vesselId", value)}
              className="w-full"
              showSearch
              filterOption={(input, option) => {
                const vessel = vessels.find((v) => v.id === option.value);
                if (!vessel) return false;
                const searchableText = `${vessel.name} ${
                  vessel.imoNumber || ""
                }`.toLowerCase();
                return searchableText.indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {vessels.map((vessel) => (
                <Option key={vessel.id} value={vessel.id}>
                  {vessel.name} {vessel.imoNumber && `(${vessel.imoNumber})`}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={5} lg={5} xl={5}>
            <Select
              placeholder="Pickup Terminal"
              allowClear
              value={filters.pickupTerminalId}
              onChange={(value) =>
                handleFilterChange("pickupTerminalId", value)
              }
              className="w-full"
              showSearch
              filterOption={(input, option) => {
                const terminal = terminals.find((t) => t.id === option.value);
                if (!terminal) return false;
                const searchableText = `${terminal.name}`.toLowerCase();
                return searchableText.indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {terminals.map((terminal) => (
                <Option key={terminal.id} value={terminal.id}>
                  {terminal.name}
                </Option>
              ))}
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
              onClick={fetchVesselSchedules}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Vessel Schedules Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={vesselSchedules}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* Vessel Schedule Form Modal */}
      <FormModal
        visible={isModalVisible}
        onCancel={closeModal}
        title={
          modalMode === "create"
            ? "Create New Vessel Schedule"
            : "Edit Vessel Schedule"
        }
        width={1200}
      >
        <VesselScheduleForm
          initialValues={selectedVesselSchedule}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isLoading={formLoading}
        />
      </FormModal>
    </div>
  );
};

export default VesselSchedules;
