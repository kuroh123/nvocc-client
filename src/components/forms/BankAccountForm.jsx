import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, Space, message, Row, Col } from "antd";
import agentService from "../../services/agentService";
import countryService from "../../services/countryService";

const { Option } = Select;

const BankAccountForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form] = Form.useForm();
  const [agents, setAgents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);

  useEffect(() => {
    fetchAgents();
    fetchCountries();
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      if (initialValues.countryId) {
        fetchStates(initialValues.countryId);
      }
    }
  }, [initialValues, form]);

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
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
      setLoadingAgents(false);
    }
  };

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await countryService.getAllCountries({
        status: "ACTIVE",
        limit: 1000,
      });

      if (response.success) {
        setCountries(response.data || []);
      } else {
        message.error("Failed to fetch countries");
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      message.error("Failed to fetch countries");
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchCurrencies = async () => {
    try {
      // Mock currencies - replace with actual currency service call if available
      setCurrencies([
        { id: "1", code: "USD", name: "US Dollar" },
        { id: "2", code: "EUR", name: "Euro" },
        { id: "3", code: "GBP", name: "British Pound" },
        { id: "4", code: "JPY", name: "Japanese Yen" },
        { id: "5", code: "AUD", name: "Australian Dollar" },
        { id: "6", code: "CAD", name: "Canadian Dollar" },
        { id: "7", code: "CHF", name: "Swiss Franc" },
        { id: "8", code: "CNY", name: "Chinese Yuan" },
        { id: "9", code: "INR", name: "Indian Rupee" },
      ]);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      // Mock states - replace with actual state service call if available
      setStates([
        { id: "1", name: "State 1" },
        { id: "2", name: "State 2" },
      ]);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const handleCountryChange = (countryId) => {
    form.setFieldValue("stateId", undefined);
    setStates([]);
    if (countryId) {
      fetchStates(countryId);
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
      initialValues={{ status: "ACTIVE" }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Agent"
            name="agentId"
            rules={[{ required: true, message: "Please select an agent" }]}
          >
            <Select
              placeholder="Select agent"
              showSearch
              loading={loadingAgents}
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
        <Col span={12}>
          <Form.Item
            label="Account Name"
            name="accountName"
            rules={[
              { required: true, message: "Please enter account name" },
              {
                max: 255,
                message: "Account name cannot exceed 255 characters",
              },
            ]}
          >
            <Input placeholder="Enter account name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Bank Name"
            name="bankName"
            rules={[
              { required: true, message: "Please enter bank name" },
              { max: 255, message: "Bank name cannot exceed 255 characters" },
            ]}
          >
            <Input placeholder="Enter bank name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Bank Branch"
            name="bankBranch"
            rules={[
              { max: 255, message: "Bank branch cannot exceed 255 characters" },
            ]}
          >
            <Input placeholder="Enter bank branch (optional)" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Account Number"
            name="accountNum"
            rules={[
              { required: true, message: "Please enter account number" },
              {
                max: 50,
                message: "Account number cannot exceed 50 characters",
              },
            ]}
          >
            <Input placeholder="Enter account number" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Currency"
            name="currencyId"
            rules={[{ required: true, message: "Please select currency" }]}
          >
            <Select placeholder="Select currency" showSearch>
              {currencies.map((currency) => (
                <Option key={currency.id} value={currency.id}>
                  {currency.code} - {currency.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="SWIFT Code"
            name="swiftCode"
            rules={[
              { max: 20, message: "SWIFT code cannot exceed 20 characters" },
            ]}
          >
            <Input placeholder="Enter SWIFT code (optional)" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="IFSC Code"
            name="ifscCode"
            rules={[
              { max: 20, message: "IFSC code cannot exceed 20 characters" },
            ]}
          >
            <Input placeholder="Enter IFSC code (optional)" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Address Line 1"
            name="addressLine1"
            rules={[
              {
                max: 255,
                message: "Address line 1 cannot exceed 255 characters",
              },
            ]}
          >
            <Input placeholder="Enter address line 1 (optional)" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Address Line 2"
            name="addressLine2"
            rules={[
              {
                max: 255,
                message: "Address line 2 cannot exceed 255 characters",
              },
            ]}
          >
            <Input placeholder="Enter address line 2 (optional)" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="City"
            name="city"
            rules={[{ max: 100, message: "City cannot exceed 100 characters" }]}
          >
            <Input placeholder="Enter city (optional)" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Country" name="countryId">
            <Select
              placeholder="Select country"
              showSearch
              loading={loadingCountries}
              onChange={handleCountryChange}
              filterOption={(input, option) => {
                const country = countries.find((c) => c.id === option.value);
                if (!country) return false;
                return (
                  country.name.toLowerCase().indexOf(input.toLowerCase()) >= 0
                );
              }}
            >
              {countries.map((country) => (
                <Option key={country.id} value={country.id}>
                  {country.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="State" name="stateId">
            <Select
              placeholder="Select state"
              showSearch
              disabled={!states.length}
            >
              {states.map((state) => (
                <Option key={state.id} value={state.id}>
                  {state.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="ZIP Code"
            name="zipCode"
            rules={[
              { max: 20, message: "ZIP code cannot exceed 20 characters" },
            ]}
          >
            <Input placeholder="Enter ZIP code (optional)" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialValues ? "Update" : "Create"} Bank Account
          </Button>
          <Button onClick={handleReset}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default BankAccountForm;
