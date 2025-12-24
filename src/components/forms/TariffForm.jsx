import React, { useState, useEffect } from "react";
import {
  Form,
  InputNumber,
  Select,
  Button,
  Space,
  message,
  Row,
  Col,
} from "antd";
import containerTypeService from "../../services/containerTypeService";
import chargeService from "../../services/chargeService";
import agentService from "../../services/agentService";
import portService from "../../services/portService";
import terminalService from "../../services/terminalService";

const { Option } = Select;

const TariffForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form] = Form.useForm();
  const [containerTypes, setContainerTypes] = useState([]);
  const [charges, setCharges] = useState([]);
  const [agents, setAgents] = useState([]);
  const [ports, setPorts] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState({
    containerTypes: false,
    agents: false,
    ports: false,
    terminals: false,
  });

  useEffect(() => {
    fetchContainerTypes();
    fetchCharges();
    fetchAgents();
    fetchPorts();
    fetchTerminals();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const fetchContainerTypes = async () => {
    try {
      setLoading((prev) => ({ ...prev, containerTypes: true }));
      const response = await containerTypeService.getAllContainerTypes({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setContainerTypes(response.data || []);
      } else {
        message.error("Failed to fetch container types");
      }
    } catch (error) {
      console.error("Error fetching container types:", error);
      message.error("Failed to fetch container types");
    } finally {
      setLoading((prev) => ({ ...prev, containerTypes: false }));
    }
  };

  const fetchCharges = async () => {
    try {
      setLoading((prev) => ({ ...prev, charges: true }));
      const response = await chargeService.getAllCharges({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setCharges(response.data || []);
      } else {
        message.error("Failed to fetch charges");
      }
    } catch (error) {
      console.error("Error fetching charges:", error);
      message.error("Failed to fetch charges");
    } finally {
      setLoading((prev) => ({ ...prev, charges: false }));
    }
  };

  const fetchAgents = async () => {
    try {
      setLoading((prev) => ({ ...prev, agents: true }));
      const response = await agentService.getAllAgents({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setAgents(response.data || []);
      } else {
        message.error("Failed to fetch agents");
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      message.error("Failed to fetch agents");
    } finally {
      setLoading((prev) => ({ ...prev, agents: false }));
    }
  };

  const fetchPorts = async () => {
    try {
      setLoading((prev) => ({ ...prev, ports: true }));
      const response = await portService.getAllPorts({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setPorts(response.data || []);
      } else {
        message.error("Failed to fetch ports");
      }
    } catch (error) {
      console.error("Error fetching ports:", error);
      message.error("Failed to fetch ports");
    } finally {
      setLoading((prev) => ({ ...prev, ports: false }));
    }
  };

  const fetchTerminals = async () => {
    try {
      setLoading((prev) => ({ ...prev, terminals: true }));
      const response = await terminalService.getAllTerminals({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setTerminals(response.data || []);
      } else {
        message.error("Failed to fetch terminals");
      }
    } catch (error) {
      console.error("Error fetching terminals:", error);
      message.error("Failed to fetch terminals");
    } finally {
      setLoading((prev) => ({ ...prev, terminals: false }));
    }
  };

  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleReset = () => {
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        eventType: "IMPORT",
        productType: "NON_HAZ",
        qty: 1,
      }}
    >
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Event Type"
            name="eventType"
            rules={[{ required: true, message: "Please select event type" }]}
          >
            <Select placeholder="Select event type">
              <Option value="IMPORT">Import</Option>
              <Option value="EXPORT">Export</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Product Type"
            name="productType"
            rules={[{ required: true, message: "Please select product type" }]}
          >
            <Select placeholder="Select product type">
              <Option value="NON_HAZ">Non-Hazardous</Option>
              <Option value="HAZ">Hazardous</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Container Type"
            name="containerTypeId"
            rules={[
              { required: true, message: "Please select container type" },
            ]}
          >
            <Select
              placeholder="Select container type"
              showSearch
              loading={loading.containerTypes}
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
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={18}>
          <Form.Item
            label="Charges"
            name="chargeId"
            rules={[{ required: true, message: "Please select Charge" }]}
          >
            <Select
              placeholder="Select charge"
              showSearch
              loading={loading.charges}
              filterOption={(input, option) => {
                const charge = charges.find((c) => c.id === option.value);
                if (!charge) return false;
                const searchableText = `${charge.name} ${
                  charge.sacHsnCode || ""
                }`.toLowerCase();
                return searchableText.indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {charges.map((charge) => (
                <Option key={charge.id} value={charge.id}>
                  {charge.name} ({charge.sacHsnCode})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Rate"
            name="rate"
            rules={[
              { required: true, message: "Please enter rate" },
              {
                type: "number",
                min: 1,
                message: "Rate must not be 0",
              },
            ]}
          >
            <InputNumber
              placeholder="Enter rate"
              min={1}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <h4>Pickup Details</h4>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Pickup Agent" name="pickAgentId">
            <Select
              placeholder="Select pickup agent"
              showSearch
              allowClear
              loading={loading.agents}
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
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Pickup Port" name="pickPortId">
            <Select
              placeholder="Select pickup port"
              showSearch
              allowClear
              loading={loading.ports}
              filterOption={(input, option) => {
                const port = ports.find((p) => p.id === option.value);
                if (!port) return false;
                const searchableText = `${port.name} ${
                  port.portCode || ""
                }`.toLowerCase();
                return searchableText.indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {ports.map((port) => (
                <Option key={port.id} value={port.id}>
                  {port.name} {port.portCode && `(${port.portCode})`}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Pickup Terminal" name="pickTerminalId">
            <Select
              placeholder="Select pickup terminal"
              showSearch
              allowClear
              loading={loading.terminals}
              filterOption={(input, option) => {
                const terminal = terminals.find((t) => t.id === option.value);
                if (!terminal) return false;
                return (
                  terminal.name.toLowerCase().indexOf(input.toLowerCase()) >= 0
                );
              }}
            >
              {terminals.map((terminal) => (
                <Option key={terminal.id} value={terminal.id}>
                  {terminal.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <h4>Next Destination Details</h4>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Next Agent" name="nextAgentId">
            <Select
              placeholder="Select next agent"
              showSearch
              allowClear
              loading={loading.agents}
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
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Next Port" name="nextPortId">
            <Select
              placeholder="Select next port"
              showSearch
              allowClear
              loading={loading.ports}
              filterOption={(input, option) => {
                const port = ports.find((p) => p.id === option.value);
                if (!port) return false;
                const searchableText = `${port.name} ${
                  port.portCode || ""
                }`.toLowerCase();
                return searchableText.indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {ports.map((port) => (
                <Option key={port.id} value={port.id}>
                  {port.name} {port.portCode && `(${port.portCode})`}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Next Terminal" name="nextTerminalId">
            <Select
              placeholder="Select next terminal"
              showSearch
              allowClear
              loading={loading.terminals}
              filterOption={(input, option) => {
                const terminal = terminals.find((t) => t.id === option.value);
                if (!terminal) return false;
                return (
                  terminal.name.toLowerCase().indexOf(input.toLowerCase()) >= 0
                );
              }}
            >
              {terminals.map((terminal) => (
                <Option key={terminal.id} value={terminal.id}>
                  {terminal.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialValues ? "Update" : "Create"} Tariff
          </Button>
          <Button onClick={handleReset}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default TariffForm;
