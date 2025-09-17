import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, Space, message, Row, Col } from "antd";
import portService from "../../services/portService";
import countryService from "../../services/countryService";

const { Option } = Select;
const { TextArea } = Input;

const PortForm = ({ initialValues, onSubmit, onCancel, isLoading = false }) => {
  const [form] = Form.useForm();
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await countryService.getAllCountries({
        status: "ACTIVE",
        limit: 1000, // Get all active countries
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

  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const portTypeOptions = [
    { value: "SEA_PORT", label: "Sea Port" },
    { value: "DRY_PORT", label: "Dry Port" },
  ];

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: "ACTIVE",
        portType: "SEA_PORT",
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Port Name"
            rules={[
              { required: true, message: "Please enter port name" },
              {
                max: 255,
                message: "Port name must be less than 255 characters",
              },
            ]}
          >
            <Input placeholder="Enter port name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="portType"
            label="Port Type"
            rules={[{ required: true, message: "Please select port type" }]}
          >
            <Select placeholder="Select port type">
              {portTypeOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="countryId"
            label="Country"
            rules={[{ required: true, message: "Please select country" }]}
          >
            <Select
              placeholder="Select country"
              loading={loadingCountries}
              showSearch
              filterOption={(input, option) => {
                // Find the country object to get the searchable text
                const country = countries.find((c) => c.id === option.value);
                if (!country) return false;

                const searchableText =
                  `${country.name} ${country.codeChar2}`.toLowerCase();
                return searchableText.indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {countries.map((country) => (
                <Option key={country.id} value={country.id}>
                  {country.name} ({country.codeChar2})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              {statusOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="portCode"
            label="Port Code"
            rules={[
              { max: 10, message: "Port code must be less than 10 characters" },
            ]}
          >
            <Input placeholder="Enter port code" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="itaCode"
            label="ITA Code"
            rules={[
              { max: 10, message: "ITA code must be less than 10 characters" },
            ]}
          >
            <Input placeholder="Enter ITA code" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="customsDetails" label="Customs Details">
        <TextArea
          rows={4}
          placeholder="Enter customs details"
          maxLength={1000}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialValues ? "Update Port" : "Create Port"}
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default PortForm;
