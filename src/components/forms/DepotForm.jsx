import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
  Row,
  Col,
  Tabs,
} from "antd";
import portService from "../../services/portService";
import countryService from "../../services/countryService";
import DocumentUpload from "../common/DocumentUpload";

const { Option } = Select;

const DepotForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [form] = Form.useForm();
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [ports, setPorts] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingPorts, setLoadingPorts] = useState(false);

  useEffect(() => {
    fetchCountries();
    fetchPorts();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      if (initialValues.countryId) {
        fetchStates(initialValues.countryId);
      }
    }
  }, [initialValues, form]);

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

  const fetchStates = async (countryId) => {
    try {
      setLoadingStates(true);
      const response = await countryService.getStatesByCountry(countryId);

      if (response.success) {
        setStates(response.data || []);
      } else {
        message.error("Failed to fetch states");
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      message.error("Failed to fetch states");
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchPorts = async () => {
    try {
      setLoadingPorts(true);
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
      setLoadingPorts(false);
    }
  };

  const handleCountryChange = (countryId) => {
    form.setFieldsValue({ stateId: undefined });
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
    setStates([]);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
      initialValues={{
        status: "ACTIVE",
      }}
    >
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Basic Information",
            children: (
              <>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Depot Name"
                      name="name"
                      rules={[
                        { required: true, message: "Please enter depot name" },
                        {
                          min: 2,
                          message: "Name must be at least 2 characters",
                        },
                      ]}
                    >
                      <Input placeholder="Enter depot name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Company"
                      name="company"
                      rules={[
                        {
                          required: true,
                          message: "Please enter company name",
                        },
                        {
                          min: 2,
                          message: "Company name must be at least 2 characters",
                        },
                      ]}
                    >
                      <Input placeholder="Enter company name" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Port" name="portId">
                      <Select
                        placeholder="Select a port"
                        allowClear
                        loading={loadingPorts}
                        showSearch
                        optionFilterProp="children"
                      >
                        {ports.map((port) => (
                          <Option key={port.id} value={port.id}>
                            {port.name} ({port.portCode})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Status" name="status" required>
                      <Select placeholder="Select status">
                        <Option value="ACTIVE">Active</Option>
                        <Option value="INACTIVE">Inactive</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Address Line 1" name="addressLine1">
                      <Input placeholder="Enter address line 1" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Address Line 2" name="addressLine2">
                      <Input placeholder="Enter address line 2" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Form.Item label="City" name="city">
                      <Input placeholder="Enter city" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item label="ZIP Code" name="zipCode">
                      <Input placeholder="Enter ZIP code" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item label="Country" name="countryId">
                      <Select
                        placeholder="Select country"
                        allowClear
                        loading={loadingCountries}
                        onChange={handleCountryChange}
                        showSearch
                        optionFilterProp="children"
                      >
                        {countries.map((country) => (
                          <Option key={country.id} value={country.id}>
                            {country.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Form.Item label="State" name="stateId">
                      <Select
                        placeholder="Select state"
                        allowClear
                        loading={loadingStates}
                        disabled={!states.length}
                        showSearch
                        optionFilterProp="children"
                      >
                        {states.map((state) => (
                          <Option key={state.id} value={state.id}>
                            {state.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item label="GST Number" name="gstNum">
                      <Input placeholder="Enter GST number" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item label="PAN Number" name="panNum">
                      <Input placeholder="Enter PAN number" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            ),
          },
          {
            key: "2",
            label: "Documents",
            children: (
              <DocumentUpload
                entityType="depot"
                entityId={initialValues?.id}
                disabled={isLoading}
              />
            ),
          },
        ]}
      />

      <Form.Item className="text-right">
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="default" onClick={handleReset}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialValues ? "Update Depot" : "Create Depot"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default DepotForm;
